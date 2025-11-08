import { VideoTemplate, CreditPack } from '@/types';
import ugcImage from '@/assets/video-ugc-product.jpg';
import serviceImage from '@/assets/video-service-business.jpg';
import softwareImage from '@/assets/video-software-ui.jpg';
import logoImage from '@/assets/video-logo-animation.jpg';

export const videoTemplates: VideoTemplate[] = [
  {
    id: 'ugc-1',
    name: 'Modern Product Showcase',
    thumbnail: ugcImage,
    category: 'ugc-product',
    duration: 15,
  },
  {
    id: 'service-1',
    name: 'Professional Consultation',
    thumbnail: serviceImage,
    category: 'service-business',
    duration: 20,
  },
  {
    id: 'software-1',
    name: 'Dashboard Analytics',
    thumbnail: softwareImage,
    category: 'software-ui',
    duration: 25,
  },
  {
    id: 'logo-1',
    name: 'Luxury Brand Animation',
    thumbnail: logoImage,
    category: 'software-ui',
    duration: 10,
  },
];

export const creditPacks: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: 20,
  },
  {
    id: 'pro',
    name: 'Professional',
    credits: 10,
    price: 35,
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 20,
    price: 60,
  },
];

// Mock Supabase client
export const mockSupabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: options?.data?.name || '',
        phone: options?.data?.phone,
        credits: 5,
        role: 'free' as const,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { data: { user }, error: null };
    },
    signIn: async ({ email, password }: any) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return { data: { user: JSON.parse(storedUser) }, error: null };
      }
      // Demo account
      if (email === 'demo@luxevideo.test' && password === 'Password123!') {
        const user = {
          id: 'demo-user',
          email,
          name: 'Demo User',
          credits: 5,
          role: 'free' as const,
        };
        localStorage.setItem('user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },
    signOut: async () => {
      localStorage.removeItem('user');
      return { error: null };
    },
    getUser: () => {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    },
  },
};

// Mock Twilio
export const mockTwilio = {
  sendVerificationCode: async (phone: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[Mock Twilio] Code sent to ${phone}: 123456`);
    return { success: true };
  },
  verifyCode: async (phone: string, code: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: code === '123456' };
  },
};

// Mock Stripe
export const mockStripe = {
  checkout: async (packId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const pack = creditPacks.find(p => p.id === packId);
    if (!pack) return { error: 'Pack not found' };
    
    console.log(`[Mock Stripe] Processing payment for ${pack.name}`);
    return { success: true, credits: pack.credits };
  },
};

// Mock n8n webhooks
export const mockN8n = {
  sendWebhook: async (workflow: string, payload: any) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log(`[Mock n8n] Webhook sent to ${workflow}:`, payload);
    return {
      success: true,
      webhookUrl: `https://example-n8n.webhook/${workflow}`,
      response: { status: 'received', id: Math.random().toString(36).substr(2, 9) }
    };
  },
};
