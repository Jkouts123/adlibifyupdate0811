export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  credits: number;
  role: 'demo' | 'free' | 'premium';
}

export interface VideoTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: 'ugc-product' | 'service-business' | 'software-ui';
  duration: number;
}

export interface GenerationHistory {
  id: string;
  userId: string;
  title: string;
  description: string;
  template: VideoTemplate;
  thumbnail: string;
  createdAt: Date;
  creditsUsed: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  projectId?: string;
  createdAt: Date;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export interface WebhookPayload {
  userId: string;
  projectId: string;
  title: string;
  description: string;
  templateId: string;
  workflow: 'ugc-product' | 'service-business' | 'software-ui-logo';
}
