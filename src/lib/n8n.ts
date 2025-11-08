import { toast } from 'sonner';

// Define the workflow types
type WorkflowType = 'ugc-product' | 'service-business' | 'software-ui-logo';

// Define the payload interfaces
interface BasePayload {
  userId: string;
  projectId: string;
  workflow: WorkflowType;
  timestamp: string;
  generationId: string;
}

interface UgcProductPayload extends BasePayload {
  description: string;
  website_url: string;
  image_base64: string | null;
}

interface ServiceBusinessPayload extends BasePayload {
  businessWebsiteUrl: string;
}

interface SoftwareUiPayload extends BasePayload {
  companyName: string;
  logoImage: string | null;
  uiScreenshot: string | null;
}

type N8nPayload = UgcProductPayload | ServiceBusinessPayload | SoftwareUiPayload;

// Get webhook URLs from environment variables
const N8N_WEBHOOKS = {
  'ugc-product': import.meta.env.VITE_N8N_WEBHOOK_UGC_PRODUCT,
  'service-business': import.meta.env.VITE_N8N_WEBHOOK_SERVICE_BUSINESS,
  'software-ui-logo': import.meta.env.VITE_N8N_WEBHOOK_SOFTWARE_UI,
};

// Get Supabase URL for proxy endpoint
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

class N8nService {
  /**
   * Send a webhook to n8n through a Supabase proxy
   * @param workflow The workflow type
   * @param payload The data to send
   * @returns Promise with the result of the webhook
   */
  async sendWebhook(workflow: WorkflowType, payload: Omit<N8nPayload, 'timestamp'>) {
    const webhookUrl = N8N_WEBHOOKS[workflow];
    
    if (!webhookUrl) {
      console.error(`[n8n] Webhook URL not configured for workflow: ${workflow}`);
      toast.error(`n8n webhook not configured for ${workflow}`);
      return {
        success: false,
        error: 'Webhook URL not configured',
      };
    }

    try {
      // Add timestamp to payload
      const payloadWithTimestamp = {
        ...payload,
        timestamp: new Date().toISOString(),
      };

      // Send through Supabase proxy to avoid CORS issues
      const proxyUrl = `${SUPABASE_URL}/functions/v1/n8n-proxy`;
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl,
          payload: payloadWithTimestamp
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`[n8n] Webhook sent successfully to ${workflow}:`, payloadWithTimestamp);
      
      return {
        success: true,
        response: result,
        webhookUrl,
      };
    } catch (error) {
      console.error(`[n8n] Failed to send webhook to ${workflow}:`, error);
      toast.error(`Failed to send webhook to ${workflow}`);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const n8nService = new N8nService();