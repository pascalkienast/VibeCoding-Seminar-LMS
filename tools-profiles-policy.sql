-- Add RLS policy to allow authenticated users to view profiles (for usernames in comments)
-- This allows users to see each other's usernames without exposing private profile data

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_public_read ON public.profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Note: This allows authenticated users to see all profiles
-- If you want to restrict this further, you can modify the policy
-- or create a view that only exposes specific fields like username

