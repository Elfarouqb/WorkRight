-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create timeline_events table for Timeline Builder
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  people_involved TEXT,
  evidence_notes TEXT,
  event_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on timeline_events
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Timeline events policies
CREATE POLICY "Users can view their own events" 
ON public.timeline_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
ON public.timeline_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.timeline_events FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.timeline_events FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_deadlines table for deadline tracking
CREATE TABLE public.user_deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissal_date DATE NOT NULL,
  deadline_type TEXT NOT NULL DEFAULT 'bezwaar_uwv',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_deadlines
ALTER TABLE public.user_deadlines ENABLE ROW LEVEL SECURITY;

-- Deadline policies
CREATE POLICY "Users can view their own deadlines" 
ON public.user_deadlines FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deadlines" 
ON public.user_deadlines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines" 
ON public.user_deadlines FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines" 
ON public.user_deadlines FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();