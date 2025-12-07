import OpenAI from "openai";
import { storage } from "./storage";
import type { SalesChecklistItem, CallTranscript, CallChecklistStatus } from "@shared/schema";

// Make OpenAI optional - app can work without AI coaching features
const openaiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

if (!openai) {
  console.log("OpenAI API key not configured - AI coaching features will be disabled");
}

interface AnalysisResult {
  coveredItems: Array<{
    checklistItemId: string;
    isCovered: boolean;
    detectedText?: string;
  }>;
  suggestedPrompts: Array<{
    promptType: string;
    message: string;
    relatedChecklistItemId?: string;
    triggerText?: string;
  }>;
}

export async function analyzeTranscriptForChecklist(
  callId: string,
  transcripts: CallTranscript[],
  checklistItems: SalesChecklistItem[],
  currentStatus: CallChecklistStatus[]
): Promise<AnalysisResult> {
  if (transcripts.length === 0 || checklistItems.length === 0) {
    return { coveredItems: [], suggestedPrompts: [] };
  }

  const conversationText = transcripts
    .map((t) => `${t.speaker === "staff" ? "STAFF" : "CUSTOMER"}: ${t.text}`)
    .join("\n");

  const uncoveredItems = checklistItems.filter((item) => {
    const status = currentStatus.find((s) => s.checklistItemId === item.id);
    return !status?.isCovered;
  });

  if (uncoveredItems.length === 0) {
    return { coveredItems: [], suggestedPrompts: [] };
  }

  // Skip AI analysis if OpenAI is not configured
  if (!openai) {
    return { coveredItems: [], suggestedPrompts: [] };
  }

  const checklistSummary = uncoveredItems
    .map((item) => ({
      id: item.id,
      question: item.question,
      keywords: item.keywords,
      isRequired: item.isRequired,
      suggestedResponse: item.suggestedResponse,
    }));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI sales coach for a PVC fencing company. Your job is to:
1. Analyze sales call conversations to detect which topics from a checklist have been discussed
2. Suggest prompts when important topics haven't been covered yet

Rules:
- Be conservative about marking items as covered - only mark if the topic was clearly discussed
- Prioritize required items in suggestions
- Keep prompts short and actionable (under 50 words)
- Consider context - if a customer mentions something related to a checklist item, it may count as covered

Respond with JSON only:
{
  "coveredItems": [
    { "checklistItemId": "id", "isCovered": true, "detectedText": "the text that indicates coverage" }
  ],
  "suggestedPrompts": [
    { "promptType": "reminder|suggestion|alert", "message": "what to say", "relatedChecklistItemId": "id", "triggerText": "what triggered this prompt" }
  ]
}`
        },
        {
          role: "user",
          content: `Analyze this sales call conversation for PVC fencing:

CONVERSATION:
${conversationText}

UNCOVERED CHECKLIST ITEMS:
${JSON.stringify(checklistSummary, null, 2)}

Identify which items have now been covered and suggest prompts for important uncovered items. Prioritize required items.`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { coveredItems: [], suggestedPrompts: [] };
    }

    const result = JSON.parse(content) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    return { coveredItems: [], suggestedPrompts: [] };
  }
}

export async function processTranscriptUpdate(callId: string): Promise<void> {
  try {
    const [transcripts, checklistItems, currentStatus] = await Promise.all([
      storage.getCallTranscripts(callId),
      storage.getActiveSalesChecklistItems(),
      storage.getCallChecklistStatus(callId),
    ]);

    const analysis = await analyzeTranscriptForChecklist(
      callId,
      transcripts,
      checklistItems,
      currentStatus
    );

    for (const item of analysis.coveredItems) {
      if (item.isCovered) {
        await storage.updateCallChecklistItemStatus(
          callId,
          item.checklistItemId,
          true,
          item.detectedText
        );
      }
    }

    const existingPrompts = await storage.getCallCoachingPrompts(callId);
    for (const prompt of analysis.suggestedPrompts) {
      const alreadyExists = existingPrompts.some(
        (p) => p.relatedChecklistItemId === prompt.relatedChecklistItemId && !p.wasAcknowledged
      );
      
      if (!alreadyExists) {
        await storage.createCallCoachingPrompt({
          callId,
          promptType: prompt.promptType,
          message: prompt.message,
          relatedChecklistItemId: prompt.relatedChecklistItemId,
          triggerText: prompt.triggerText,
        });
      }
    }
  } catch (error) {
    console.error("Error processing transcript update:", error);
  }
}

export async function generateSuggestedResponse(
  callId: string,
  customerQuestion: string
): Promise<string | null> {
  // Skip if OpenAI is not configured
  if (!openai) {
    return null;
  }

  try {
    const [transcripts, checklistItems] = await Promise.all([
      storage.getCallTranscripts(callId),
      storage.getActiveSalesChecklistItems(),
    ]);

    const conversationContext = transcripts
      .slice(-10)
      .map((t) => `${t.speaker === "staff" ? "STAFF" : "CUSTOMER"}: ${t.text}`)
      .join("\n");

    const relevantItem = checklistItems.find((item) => {
      if (!item.keywords) return false;
      const keywords = item.keywords as string[];
      const questionLower = customerQuestion.toLowerCase();
      return keywords.some((kw) => questionLower.includes(kw.toLowerCase()));
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful sales assistant for Probuild PVC, a Western Australian PVC fencing manufacturer. 
Generate a professional, friendly response to help the sales staff answer customer questions.
Keep responses concise (2-3 sentences max) and focused on PVC fencing.
Use Australian English spellings.`
        },
        {
          role: "user",
          content: `Recent conversation context:
${conversationContext}

Customer just asked: "${customerQuestion}"

${relevantItem?.suggestedResponse ? `Related product info: ${relevantItem.suggestedResponse}` : ""}

Generate a helpful response the staff member can use:`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Error generating response:", error);
    return null;
  }
}

export function detectKeywordsInTranscript(
  text: string,
  checklistItems: SalesChecklistItem[]
): SalesChecklistItem[] {
  const textLower = text.toLowerCase();
  
  return checklistItems.filter((item) => {
    if (!item.keywords) return false;
    const keywords = item.keywords as string[];
    return keywords.some((kw) => textLower.includes(kw.toLowerCase()));
  });
}
