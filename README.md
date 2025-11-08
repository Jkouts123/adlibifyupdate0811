# adlibify - Premium Video Generation Platform

A luxury AI-powered video generation SaaS with three powerful workflows: UGC Product, Service Business, and Software UI + Logo.

## 🚀 Features

- **Three Generation Workflows**
  - UGC Product: User-generated content style product ads
  - Service Business: Professional service-style videos
  - Software UI + Logo: Sleek software demonstrations

- **Authentication System**
  - Email/password sign-in and sign-up
  - Phone verification with Firebase OTP (replaces Twilio)
  - Session management with localStorage

- **Credit-Based System**
  - New users start with 1 free credits
  - Stripe integration for purchasing credit packs
  - Real-time credit tracking

- **Generation History**
  - Track all generated videos
  - Play and download actions

- **n8n Webhook Integration**
  - Send generation data to n8n workflows
  - Three webhook endpoints (one per workflow type)
  - JSON payload inspection

- **Automatic Video Processing Timeout**
  - Videos stuck in processing for more than 15 minutes are automatically marked as failed
  - Cron job runs every 15 minutes to check for stuck videos
  - Users see clear status updates in their history

## 🎨 Design System

The app uses a luxury design aesthetic with:
- **Fonts**: Playfair Display (headings), Inter (body)
- **Colors**: Luxury Gold (#D4AF37), Deep Black (#0A0A0A)
- **Effects**: Glassmorphism, gold glows, smooth animations
- **Responsive**: Mobile-first approach

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **State**: React Context API
- **Authentication**: Supabase Auth + Firebase OTP for phone verification
- **Animations**: CSS transitions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with your credentials:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Firebase (for phone verification)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# N8n WebHooks
VITE_N8N_WEBHOOK_UGC_PRODUCT = Your N8N workflow endpoint
VITE_N8N_WEBHOOK_SERVICE_BUSINESS = Your N8N workflow endpoint
VITE_N8N_WEBHOOK_SOFTWARE_UI = Your N8N workflow endpoint

```

### 3. Run Development Server
```bash
npm run dev
```

## 🔧 Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project at https://supabase.com/
2. Copy your project URL and anon key to the `.env` file
3. Run the database migrations:

```bash
npx supabase migration up
```

### 2. Firebase Setup for Phone Verification
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Phone Authentication in the Firebase Console
3. Add your web app to the Firebase project
4. Copy the Firebase configuration to your `.env` file
5. Add your domain to the Firebase authorized domains list

### 3. Stripe Integration
For testing payments:
1. Create a Stripe account at https://stripe.com/
2. Get your publishable key
3. Update the payment components with your key

### 4. Deploy Supabase Functions
Deploy the required Supabase Edge Functions:

```bash
# Deploy the video timeout check function
npx supabase functions deploy video-timeout-check

# Deploy other required functions
npx supabase functions deploy store-video
npx supabase functions deploy n8n-proxy
```

## 🔑 Integrations

### Supabase (Real Implementation)
Located in `src/lib/supabase.ts` and `src/contexts/AuthContext.tsx`:
- `supabase.auth.signUp()` - Create new user
- `supabase.auth.signIn()` - Authenticate user
- `supabase.auth.signOut()` - Sign out user

### Firebase OTP (Real Implementation)
Located in `src/lib/firebase.ts` and `src/components/AuthModal.tsx`:
- Phone number verification during signup
- Firebase Authentication for SMS OTP
- Automatic phone verification status update

### Stripe
Located in `src/lib/mockData.ts`:
- `mockStripe.checkout(packId)` - Process payment

**To replace with real Stripe:**
1. Install `@stripe/stripe-js`
2. Add your Stripe publishable key
3. Update `src/components/PaywallModal.tsx` to use Stripe Checkout
4. Set up webhook for payment confirmation

### n8n Webhooks 
Located in `src/lib/n8n.ts`:
- `n8nService.sendWebhook(workflow, payload)` - Send to n8n webhook
# adlibifyupdate0811
