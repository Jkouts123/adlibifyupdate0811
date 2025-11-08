-- Add phone verification fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verification_code TEXT,
ADD COLUMN IF NOT EXISTS phone_verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON profiles (phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification_code ON profiles (phone_verification_code);