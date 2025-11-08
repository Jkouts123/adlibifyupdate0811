import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Phone, CheckCircle } from 'lucide-react';
// Firebase imports
import { auth, signInWithPhoneNumber, RecaptchaVerifier } from '@/lib/firebase';
import type { ConfirmationResult } from '@/lib/firebase';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneVerification, setPhoneVerification] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<any>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+61'); // Default Australia

  // Initialize reCAPTCHA verifier
  const initializeRecaptcha = () => {
    if (!recaptchaContainerRef.current) {
      console.log('reCAPTCHA container not ready');
      return false;
    }

    try {
      // Clear any existing verifier
      if (recaptchaVerifierRef.current) {
        console.log('Clearing existing reCAPTCHA verifier');
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      
      // Create new verifier
      console.log('Creating new reCAPTCHA verifier');
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved
          console.log('reCAPTCHA solved', response);
        },
        'expired-callback': () => {
          // Response expired, reset
          console.log('reCAPTCHA expired');
          toast.error('Verification expired. Please try again.');
          setPhoneVerification('idle');
        },
        'error-callback': (error: any) => {
          console.error('reCAPTCHA error:', error);
          toast.error('Verification error. Please try again.');
          setPhoneVerification('idle');
        }
      });
      
      console.log('reCAPTCHA verifier created successfully');
      return true;
    } catch (error) {
      console.error('Error creating reCAPTCHA verifier:', error);
      toast.error('Failed to initialize verification system. Please try again.');
      return false;
    }
  };

  // Ensure reCAPTCHA is ready
  const ensureRecaptchaReady = async () => {
    // If already initialized, return true
    if (recaptchaVerifierRef.current) {
      return true;
    }
    
    // Try to initialize
    const initialized = initializeRecaptcha();
    if (!initialized) {
      // Wait a bit and try once more
      await new Promise(resolve => setTimeout(resolve, 500));
      return initializeRecaptcha();
    }
    
    return initialized;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(signInEmail, signInPassword);
      if (error) {
        toast.error(error.message || 'Failed to sign in');
      } else {
        toast.success('Welcome back!');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!signUpPhone) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setLoading(true);
    setPhoneVerification('sending');
    
    try {
      // Ensure reCAPTCHA is ready
      const isReady = await ensureRecaptchaReady();
      if (!isReady) {
        throw new Error('Failed to initialize verification system');
      }
      
      const fullPhoneNumber = `${countryCode}${signUpPhone}`;
      console.log('Attempting to send code to:', fullPhoneNumber);
      
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setPhoneVerification('sent');
      toast.success('Verification code sent to your phone!');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      setPhoneVerification('error');
      
      // Provide more specific error messages
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number. Please check the number and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/quota-exceeded') {
        toast.error('SMS quota exceeded. Please try again later.');
      } else if (error.message.includes('reCAPTCHA')) {
        toast.error('Verification system not ready. Please wait a moment and try again.');
      } else {
        toast.error(error.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }
    
    if (!confirmationResult) {
      toast.error('Verification session expired. Please request a new code.');
      setPhoneVerification('idle');
      return;
    }
    
    setLoading(true);
    setPhoneVerification('verifying');
    
    try {
      await confirmationResult.confirm(verificationCode);
      setPhoneVerification('verified');
      toast.success('Phone number verified successfully!');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setPhoneVerification('sent'); // Allow retry
      
      // Provide more specific error messages
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid verification code. Please check the code and try again.');
      } else {
        toast.error(error.message || 'Invalid verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if phone is required and verified
    if (!signUpPhone) {
      toast.error('Phone number is required');
      return;
    }
    
    if (phoneVerification !== 'verified') {
      toast.error('Please verify your phone number first');
      return;
    }
    
    setLoading(true);
    
    try {
      const fullPhone = signUpPhone ? `${countryCode}${signUpPhone}` : undefined;
      const { error } = await signUp(signUpEmail, signUpPassword, signUpName, fullPhone, countryCode);
      
      if (error) {
        toast.error(error.message || 'Failed to sign up');
      } else {
        toast.success('Account created! You have 1 free credit.');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset verification when phone number changes
  useEffect(() => {
    if (phoneVerification === 'verified') {
      setPhoneVerification('idle');
      setVerificationCode('');
      setConfirmationResult(null);
    }
  }, [signUpPhone, countryCode]);

  // Initialize reCAPTCHA when modal opens
  useEffect(() => {
    if (open) {
      console.log('Modal opened, initializing reCAPTCHA');
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeRecaptcha();
      }, 300);
      
      return () => {
        clearTimeout(timer);
        // Cleanup when component unmounts or modal closes
        if (recaptchaVerifierRef.current) {
          console.log('Cleaning up reCAPTCHA verifier');
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset verification state when closing modal
        setPhoneVerification('idle');
        setVerificationCode('');
        setConfirmationResult(null);
      }
      onClose();
    }}>
      <DialogContent className="dark:glass-luxury border-primary/20 sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">Welcome to adlibify</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sign in or create an account to start generating videos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-luxury">
            <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="glass-luxury border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="glass-luxury border-primary/20"
                />
              </div>
              <Button type="submit" variant="luxury" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  className="glass-luxury border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  className="glass-luxury border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  className="glass-luxury border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone *</Label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className=" border-primary/20 rounded-md px-3 bg-black text-white"
                    disabled={phoneVerification !== 'idle' && phoneVerification !== 'error'}
                  >
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+251">🇪🇹 +251</option>
                  </select>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="412 345 678"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    required
                    className="glass-luxury border-primary/20"
                    disabled={phoneVerification !== 'idle' && phoneVerification !== 'error'}
                  />
                  
                
                </div>

                {phoneVerification === 'idle' && signUpPhone && (
                  <div className='flex items-center justify-start gap-2 my-2'> 
                    <span className='mr-2 '>
                      Send Verification Code
                  </span>
                    <Button 
                      type="button" 
                      variant="outline-gold" 
                      onClick={handleSendCode} 
                      disabled={loading}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  )}
                  {phoneVerification === 'verified' && (
                    <div className="flex items-center justify-center bg-green-500/20 rounded-md px-3">
                      <CheckCircle className="h-8 w-5 text-green-500" />
                    </div>
                  )}

                
                {/* ReCAPTCHA container */}
                <div ref={recaptchaContainerRef} className="flex justify-center h-12"></div>
                
                {phoneVerification === 'sending' && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending verification code...
                  </div>
                )}
                
                {phoneVerification === 'sent' && (
                  <div className="space-y-2">
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        className="glass-luxury border-primary/20"
                      />
                      <Button 
                        type="button" 
                        variant="outline-gold" 
                        onClick={handleVerifyCode} 
                        disabled={loading || verificationCode.length !== 6}
                      >
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the code sent to your phone
                    </p>
                  </div>
                )}
                
                {phoneVerification === 'verifying' && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying code...
                  </div>
                )}
                
                {phoneVerification === 'verified' && (
                  <p className="text-sm text-green-500 flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Phone verified successfully!
                  </p>
                )}
                
                {phoneVerification === 'error' && (
                  <div className="text-sm text-destructive">
                    Failed to send verification code. Please check your phone number and try again.
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                variant="luxury" 
                className="w-full" 
                disabled={loading || phoneVerification !== 'verified'}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Get 1 free credit on signup!
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};