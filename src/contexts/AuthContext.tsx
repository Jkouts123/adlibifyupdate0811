import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  credits: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, phone?: string, countryCode?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from profiles table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      phone: data.phone,
      credits: data.credits,
      role: data.role
    };
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id).then(profile => {
              if (profile) setUser(profile);
            });
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (data?.user && !error) {
      const profile = await fetchUserProfile(data.user.id);
      if (profile) setUser(profile);
    }
    
    return { error };
  };

  // const signUp = async (email: string, password: string, name: string, phone?: string, countryCode?: string) => {
  //   const redirectUrl = `${window.location.origin}/`;
    
  //   const { data, error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: redirectUrl,
  //       data: {
  //         full_name: name,
  //         phone: phone,
  //         country_code: countryCode || '+61',
  //       }
  //     }
  //   });
    
  //   if (data?.user && !error) {
  //     // Update the profile to mark phone as verified
  //     if (phone) {
  //       await supabase
  //         .from('profiles')
  //         .update({ 
  //           phone_verified: true,
  //           updated_at: new Date().toISOString()
  //         })
  //         .eq('id', data.user.id);
  //     }
      
  //     const profile = await fetchUserProfile(data.user.id);
  //     if (profile) setUser(profile);
  //   }
    
  //   return { error };
  // };

  const signUp = async (
  email: string,
  password: string,
  name: string,
  phone?: string,
  countryCode?: string
) => {
  const redirectUrl = `${window.location.origin}/`;

  // 1️⃣ Create the user in auth.users
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: name,
        phone: phone,
        country_code: countryCode || '+61',
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    return { error };
  }

  if (data?.user) {
    const userId = data.user.id;

    // 2️⃣ Manually create profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: name,
        email,
        phone: phone || null,
        country_code: countryCode || '+61',
        credits: 1,
        role: 'free',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return { error: profileError };
    }

    // 3️⃣ Mark phone as verified if provided
    if (phone) {
      const { error: phoneError } = await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (phoneError) console.error('Phone verification update failed:', phoneError);
    }

    // 4️⃣ Fetch the profile and update state
    const profile = await fetchUserProfile(userId);
    if (profile) setUser(profile);
  }

  return { error };
};


  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateCredits = async (credits: number) => {
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ credits })
        .eq('id', user.id);
      
      if (!error) {
        setUser({ ...user, credits });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};