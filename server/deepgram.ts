import WebSocket, { WebSocketServer } from "ws";
import { storage } from "./storage";
import { processTranscriptUpdate } from "./coaching";
import type { Server as HttpServer } from "http";

interface DeepgramConfig {
  encoding?: string;
  sample_rate?: number;
  channels?: number;
  model?: string;
  language?: string;
  punctuate?: boolean;
  interim_results?: boolean;
  diarize?: boolean;
  smart_format?: boolean;
}

// Singleton WebSocket server for media streams
let mediaStreamWss: WebSocketServer | null = null;

interface DeepgramAlternative {
  transcript: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: number;
  }>;
}

interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

interface DeepgramMessage {
  type: string;
  channel?: DeepgramChannel;
  is_final?: boolean;
  speech_final?: boolean;
  start?: number;
  duration?: number;
  metadata?: {
    request_id: string;
    model_uuid: string;
  };
}

export class DeepgramTranscriber {
  private ws: WebSocket | null = null;
  private callId: string;
  private isConnected: boolean = false;
  private pendingAudio: Buffer[] = [];
  private lastTranscriptTime: number = 0;
  private analysisDebounceTimer: NodeJS.Timeout | null = null;

  constructor(callId: string) {
    this.callId = callId;
  }

  async connect(config: DeepgramConfig = {}, retryCount = 0): Promise<void> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPGRAM_API_KEY environment variable not set");
    }

    const maxRetries = 3;
    const baseDelay = 1000;

    const defaultConfig: DeepgramConfig = {
      encoding: "mulaw",
      sample_rate: 8000,
      channels: 1,
      model: "nova-2",
      language: "en-AU",
      punctuate: true,
      interim_results: true,
      diarize: true,
      smart_format: true,
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    const queryParams = new URLSearchParams();
    Object.entries(finalConfig).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const url = `wss://api.deepgram.com/v1/listen?${queryParams.toString()}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url, {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      });

      this.ws.on("open", () => {
        console.log(`Deepgram connected for call ${this.callId}`);
        this.isConnected = true;
        
        // Send any pending audio
        while (this.pendingAudio.length > 0) {
          const audio = this.pendingAudio.shift();
          if (audio && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(audio);
          }
        }
        
        resolve();
      });

      this.ws.on("message", async (data: WebSocket.Data) => {
        try {
          const message: DeepgramMessage = JSON.parse(data.toString());
          await this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing Deepgram message:", error);
        }
      });

      this.ws.on("error", async (error) => {
        console.error(`Deepgram error for call ${this.callId}:`, error);
        
        // Retry with exponential backoff
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          console.log(`Retrying Deepgram connection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          
          setTimeout(async () => {
            try {
              await this.connect(config, retryCount + 1);
              resolve();
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        } else {
          console.error(`Deepgram connection failed after ${maxRetries} retries for call ${this.callId}`);
          reject(error);
        }
      });

      this.ws.on("close", (code, reason) => {
        console.log(`Deepgram closed for call ${this.callId}: ${code} - ${reason}`);
        this.isConnected = false;
      });
    });
  }

  sendAudio(audioData: Buffer): void {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    } else {
      // Buffer audio until connected
      this.pendingAudio.push(audioData);
    }
  }

  private async handleMessage(message: DeepgramMessage): Promise<void> {
    if (message.type === "Results" && message.channel) {
      const alternative = message.channel.alternatives[0];
      const transcript = alternative?.transcript;
      
      if (transcript && transcript.trim().length > 0) {
        const isFinal = message.is_final;
        
        // Determine speaker from diarization
        const words = alternative?.words || [];
        const speakerNum = words[0]?.speaker ?? 0;
        // Speaker 0 is typically the first speaker (staff), Speaker 1 is second (customer)
        const speaker = speakerNum === 0 ? "staff" : "customer";

        // Only save final transcripts to database
        if (isFinal) {
          await storage.createCallTranscript({
            callId: this.callId,
            speaker,
            text: transcript,
            confidence: alternative?.confidence?.toString(),
            startTime: message.start?.toString(),
            endTime: message.start !== undefined && message.duration !== undefined 
              ? (message.start + message.duration).toString()
              : undefined,
          });

          // Debounce AI analysis to avoid too many API calls
          this.lastTranscriptTime = Date.now();
          this.scheduleAnalysis();
        }
      }
    }
  }

  private scheduleAnalysis(): void {
    // Clear existing timer
    if (this.analysisDebounceTimer) {
      clearTimeout(this.analysisDebounceTimer);
    }

    // Wait 3 seconds of silence before running AI analysis
    this.analysisDebounceTimer = setTimeout(async () => {
      const timeSinceLastTranscript = Date.now() - this.lastTranscriptTime;
      if (timeSinceLastTranscript >= 2900) {
        try {
          await processTranscriptUpdate(this.callId);
        } catch (error) {
          console.error("Error running AI analysis:", error);
        }
      }
    }, 3000);
  }

  async close(): Promise<void> {
    if (this.analysisDebounceTimer) {
      clearTimeout(this.analysisDebounceTimer);
    }

    if (this.ws) {
      // Send close message to Deepgram
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "CloseStream" }));
      }
      
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }

    // Run final analysis
    try {
      await processTranscriptUpdate(this.callId);
    } catch (error) {
      console.error("Error running final AI analysis:", error);
    }
  }
}

// Active transcriber sessions by call SID
const activeTranscribers = new Map<string, DeepgramTranscriber>();

export function getTranscriber(callSid: string): DeepgramTranscriber | undefined {
  return activeTranscribers.get(callSid);
}

export async function startTranscriber(callId: string, callSid: string): Promise<DeepgramTranscriber> {
  const transcriber = new DeepgramTranscriber(callId);
  await transcriber.connect();
  activeTranscribers.set(callSid, transcriber);
  return transcriber;
}

export async function stopTranscriber(callSid: string): Promise<void> {
  const transcriber = activeTranscribers.get(callSid);
  if (transcriber) {
    await transcriber.close();
    activeTranscribers.delete(callSid);
  }
}

// Initialize singleton WebSocket server for Twilio Media Streams
export function initializeMediaStreamServer(httpServer: HttpServer): void {
  if (mediaStreamWss) {
    console.log("Media stream WebSocket server already initialized");
    return;
  }

  mediaStreamWss = new WebSocketServer({ noServer: true });
  console.log("Media stream WebSocket server initialized");

  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    
    if (url.pathname === "/api/twilio/media-stream") {
      const callSid = url.searchParams.get("callSid");
      const callId = url.searchParams.get("callId");

      if (!callSid || !callId) {
        console.error("Missing callSid or callId in media stream request");
        socket.destroy();
        return;
      }

      mediaStreamWss!.handleUpgrade(request, socket, head, (ws) => {
        console.log(`Media stream WebSocket connected for call ${callSid}`);
        handleTwilioMediaStream(ws, callSid, callId);
      });
    }
  });
}

// Handle Twilio Media Stream WebSocket connection
export function handleTwilioMediaStream(ws: WebSocket, callSid: string, callId: string): void {
  let transcriber: DeepgramTranscriber | null = null;
  let streamSid: string | null = null;
  let transcriptionFailed = false;

  ws.on("message", async (data: WebSocket.Data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.event) {
        case "connected":
          console.log(`Twilio Media Stream connected for call ${callSid}`);
          break;

        case "start":
          streamSid = message.start.streamSid;
          console.log(`Twilio Media Stream started: ${streamSid}`);
          
          // Start Deepgram transcriber with fallback handling
          try {
            transcriber = await startTranscriber(callId, callSid);
          } catch (error) {
            console.error("Failed to start Deepgram transcriber:", error);
            transcriptionFailed = true;
            // Continue without transcription - call still works, just no AI coaching
          }
          break;

        case "media":
          // Forward audio to Deepgram (only if transcription is active)
          if (!transcriptionFailed && transcriber && message.media?.payload) {
            const audioBuffer = Buffer.from(message.media.payload, "base64");
            transcriber.sendAudio(audioBuffer);
          }
          break;

        case "stop":
          console.log(`Twilio Media Stream stopped for call ${callSid}`);
          if (transcriber) {
            try {
              await transcriber.close();
            } catch (error) {
              console.error("Error closing transcriber:", error);
            }
            activeTranscribers.delete(callSid);
          }
          break;

        default:
          // Ignore other events
          break;
      }
    } catch (error) {
      console.error("Error handling Twilio media stream message:", error);
    }
  });

  ws.on("close", async () => {
    console.log(`Twilio Media Stream WebSocket closed for call ${callSid}`);
    await stopTranscriber(callSid);
  });

  ws.on("error", (error) => {
    console.error(`Twilio Media Stream WebSocket error for call ${callSid}:`, error);
  });
}
