import { storage } from './storage';
import { sendSMS } from './twilio';
import type { AutomationCampaign, Client, Lead, Quote, Job, Payment } from '@shared/schema';

interface ProcessingContext {
  client: Client;
  lead?: Lead;
  quote?: Quote;
  job?: Job;
  payment?: Payment;
}

function replacePlaceholders(template: string, context: ProcessingContext): string {
  let message = template;
  
  if (context.client) {
    message = message.replace(/{client_name}/g, context.client.name || 'Valued Customer');
    message = message.replace(/{client_phone}/g, context.client.phone || '');
    message = message.replace(/{client_email}/g, context.client.email || '');
  }
  
  if (context.lead) {
    message = message.replace(/{lead_number}/g, context.lead.leadNumber || '');
    message = message.replace(/{site_address}/g, context.lead.siteAddress || '');
  }
  
  if (context.quote) {
    message = message.replace(/{quote_number}/g, context.quote.quoteNumber || '');
    message = message.replace(/{quote_amount}/g, context.quote.totalAmount ? `$${parseFloat(context.quote.totalAmount).toLocaleString()}` : '');
  }
  
  if (context.job) {
    message = message.replace(/{job_number}/g, context.job.jobNumber || '');
    message = message.replace(/{job_address}/g, context.job.siteAddress || '');
  }
  
  if (context.payment) {
    message = message.replace(/{payment_amount}/g, context.payment.amount ? `$${parseFloat(context.payment.amount).toLocaleString()}` : '');
    message = message.replace(/{invoice_number}/g, context.payment.invoiceNumber || '');
  }
  
  return message;
}

function isWithinSendWindow(sendWindow: string | null): boolean {
  if (!sendWindow) return true;
  
  const [startTime, endTime] = sendWindow.split('-');
  if (!startTime || !endTime) return true;
  
  const now = new Date();
  const perthTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Perth" }));
  const currentHour = perthTime.getHours();
  const currentMinute = perthTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
}

async function processPaymentDueCampaigns(campaign: AutomationCampaign): Promise<number> {
  let messagesSent = 0;
  
  try {
    const payments = await storage.getPayments();
    const pendingPayments = payments.filter(p => p.status === 'pending');
    
    for (const payment of pendingPayments) {
      const createdAt = new Date(payment.createdAt);
      const delayMs = (campaign.delayDays * 24 * 60 * 60 * 1000) + (campaign.delayHours * 60 * 60 * 1000);
      const triggerTime = new Date(createdAt.getTime() + delayMs);
      
      if (new Date() < triggerTime) {
        continue;
      }
      
      const existingLogs = await storage.getSMSLogsByEntity('payment', payment.id);
      const alreadySent = existingLogs.some(log => log.isOutbound);
      
      if (alreadySent) {
        continue;
      }
      
      const client = payment.clientId ? await storage.getClient(payment.clientId) : null;
      if (!client || !client.phone) {
        console.log(`Skipping payment ${payment.id} - no client phone number`);
        continue;
      }
      
      if (campaign.clientType && client.clientType !== campaign.clientType) {
        continue;
      }
      
      let quote: Quote | undefined;
      let job: Job | undefined;
      let lead: Lead | undefined;
      
      if (payment.quoteId) {
        quote = await storage.getQuote(payment.quoteId) || undefined;
      }
      if (payment.jobId) {
        job = await storage.getJob(payment.jobId) || undefined;
        if (job?.leadId) {
          lead = await storage.getLead(job.leadId) || undefined;
        }
      }
      
      const message = replacePlaceholders(campaign.messageTemplate, {
        client,
        lead,
        quote,
        job,
        payment,
      });
      
      try {
        const result = await sendSMS(client.phone, message);
        
        await storage.createSMSLog({
          recipientPhone: client.phone,
          recipientName: client.name,
          message,
          isOutbound: true,
          status: 'sent',
          twilioMessageSid: result?.sid || null,
          relatedEntityType: 'payment',
          relatedEntityId: payment.id,
          sentAt: new Date(),
        });
        
        console.log(`Automation: Sent payment_due message to ${client.name} (${client.phone})`);
        messagesSent++;
      } catch (error) {
        console.error(`Automation: Failed to send SMS to ${client.phone}:`, error);
        
        await storage.createSMSLog({
          recipientPhone: client.phone,
          recipientName: client.name,
          message,
          isOutbound: true,
          status: 'failed',
          twilioMessageSid: null,
          relatedEntityType: 'payment',
          relatedEntityId: payment.id,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    console.error('Error processing payment_due campaigns:', error);
  }
  
  return messagesSent;
}

async function processQuoteSentCampaigns(campaign: AutomationCampaign): Promise<number> {
  let messagesSent = 0;
  
  try {
    const quotes = await storage.getQuotes();
    const sentQuotes = quotes.filter(q => q.status === 'sent');
    
    for (const quote of sentQuotes) {
      const sentAt = quote.sentAt ? new Date(quote.sentAt) : new Date(quote.createdAt);
      const delayMs = (campaign.delayDays * 24 * 60 * 60 * 1000) + (campaign.delayHours * 60 * 60 * 1000);
      const triggerTime = new Date(sentAt.getTime() + delayMs);
      
      if (new Date() < triggerTime) {
        continue;
      }
      
      const existingLogs = await storage.getSMSLogsByEntity('quote', quote.id);
      const alreadySent = existingLogs.some(log => log.isOutbound);
      
      if (alreadySent) {
        continue;
      }
      
      const client = quote.clientId ? await storage.getClient(quote.clientId) : null;
      if (!client || !client.phone) {
        continue;
      }
      
      if (campaign.clientType && client.clientType !== campaign.clientType) {
        continue;
      }
      
      let lead: Lead | undefined;
      if (quote.leadId) {
        lead = await storage.getLead(quote.leadId) || undefined;
      }
      
      const message = replacePlaceholders(campaign.messageTemplate, {
        client,
        lead,
        quote,
      });
      
      try {
        const result = await sendSMS(client.phone, message);
        
        await storage.createSMSLog({
          recipientPhone: client.phone,
          recipientName: client.name,
          message,
          isOutbound: true,
          status: 'sent',
          twilioMessageSid: result?.sid || null,
          relatedEntityType: 'quote',
          relatedEntityId: quote.id,
          sentAt: new Date(),
        });
        
        console.log(`Automation: Sent quote_sent message to ${client.name} (${client.phone})`);
        messagesSent++;
      } catch (error) {
        console.error(`Automation: Failed to send SMS to ${client.phone}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing quote_sent campaigns:', error);
  }
  
  return messagesSent;
}

async function processNewLeadCampaigns(campaign: AutomationCampaign): Promise<number> {
  let messagesSent = 0;
  
  try {
    const leads = await storage.getLeads();
    const newLeads = leads.filter(l => l.stage === 'new');
    
    for (const lead of newLeads) {
      const createdAt = new Date(lead.createdAt);
      const delayMs = (campaign.delayDays * 24 * 60 * 60 * 1000) + (campaign.delayHours * 60 * 60 * 1000);
      const triggerTime = new Date(createdAt.getTime() + delayMs);
      
      if (new Date() < triggerTime) {
        continue;
      }
      
      const existingLogs = await storage.getSMSLogsByEntity('lead', lead.id);
      const alreadySent = existingLogs.some(log => log.isOutbound);
      
      if (alreadySent) {
        continue;
      }
      
      const client = lead.clientId ? await storage.getClient(lead.clientId) : null;
      if (!client || !client.phone) {
        continue;
      }
      
      if (campaign.clientType && client.clientType !== campaign.clientType) {
        continue;
      }
      
      const message = replacePlaceholders(campaign.messageTemplate, {
        client,
        lead,
      });
      
      try {
        const result = await sendSMS(client.phone, message);
        
        await storage.createSMSLog({
          recipientPhone: client.phone,
          recipientName: client.name,
          message,
          isOutbound: true,
          status: 'sent',
          twilioMessageSid: result?.sid || null,
          relatedEntityType: 'lead',
          relatedEntityId: lead.id,
          sentAt: new Date(),
        });
        
        console.log(`Automation: Sent lead_new message to ${client.name} (${client.phone})`);
        messagesSent++;
      } catch (error) {
        console.error(`Automation: Failed to send SMS to ${client.phone}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing lead_new campaigns:', error);
  }
  
  return messagesSent;
}

export async function processAutomationCampaigns(): Promise<{ processed: number; sent: number }> {
  console.log('Automation: Starting campaign processing...');
  
  let totalProcessed = 0;
  let totalSent = 0;
  
  try {
    const campaigns = await storage.getAutomationCampaigns();
    const activeCampaigns = campaigns.filter(c => c.isActive);
    
    console.log(`Automation: Found ${activeCampaigns.length} active campaigns`);
    
    for (const campaign of activeCampaigns) {
      if (!isWithinSendWindow(campaign.sendWindow)) {
        console.log(`Automation: Campaign "${campaign.name}" outside send window (${campaign.sendWindow})`);
        continue;
      }
      
      totalProcessed++;
      let sent = 0;
      
      switch (campaign.trigger) {
        case 'payment_due':
          sent = await processPaymentDueCampaigns(campaign);
          break;
        case 'quote_sent':
          sent = await processQuoteSentCampaigns(campaign);
          break;
        case 'lead_new':
          sent = await processNewLeadCampaigns(campaign);
          break;
        default:
          console.log(`Automation: Trigger "${campaign.trigger}" not yet implemented`);
      }
      
      totalSent += sent;
    }
  } catch (error) {
    console.error('Automation: Error processing campaigns:', error);
  }
  
  console.log(`Automation: Completed - processed ${totalProcessed} campaigns, sent ${totalSent} messages`);
  
  return { processed: totalProcessed, sent: totalSent };
}

let automationInterval: NodeJS.Timeout | null = null;

export function startAutomationProcessor(intervalMinutes: number = 5) {
  if (automationInterval) {
    console.log('Automation: Processor already running');
    return;
  }
  
  console.log(`Automation: Starting processor (runs every ${intervalMinutes} minutes)`);
  
  processAutomationCampaigns();
  
  automationInterval = setInterval(() => {
    processAutomationCampaigns();
  }, intervalMinutes * 60 * 1000);
}

export function stopAutomationProcessor() {
  if (automationInterval) {
    clearInterval(automationInterval);
    automationInterval = null;
    console.log('Automation: Processor stopped');
  }
}
