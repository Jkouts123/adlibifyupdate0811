import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button-variants';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateCredits, user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Use useRef to ensure we only process the payment once
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Early return if already processed
    if (hasProcessed.current) {
      setVerifying(false);
      setSuccess(true);
      return;
    }

    const verifyPayment = async () => {
      // Set the ref to true immediately to prevent duplicate calls
      hasProcessed.current = true;
      
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId },
        });

        if (error) throw error;

        if (data?.success) {
          updateCredits(data.totalCredits);
          setSuccess(true);
          toast.success(`${data.creditsAdded} credits added to your account!`);
        }
      } catch (error) {
        console.error('Verification error:', error);
        toast.error('Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, updateCredits]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <h1 className="text-3xl font-display font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">Your credits have been added to your account.</p>
          <Button 
            variant="luxury" 
            onClick={() => {
              // Add a small delay to ensure state updates have propagated
              setTimeout(() => {
                window.close();
              }, 100);
            }}
          >
            Close Window
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-display">Something went wrong</h1>
        <Button variant="outline-gold" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    </div>
  );
}