import { useState } from 'react';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { PaywallModal } from '@/components/PaywallModal';
import { Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import Studio from './Studio';
import History from './History';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onAuthClick={() => setAuthModalOpen(true)} 
        onUpgradeClick={() => setPaywallModalOpen(true)} 
      />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/studio" 
            element={
              <Studio onInsufficientCredits={() => setPaywallModalOpen(true)} />
            } 
          />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      <footer className="glass-luxury border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-display font-bold text-foreground">adlibify</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} adlibify. All rights reserved.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                AI-Powered Video Generation Platform
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PaywallModal open={paywallModalOpen} onClose={() => setPaywallModalOpen(false)} />
    </div>
  );
};

export default Index;