
CREATE TYPE public.pin_type AS ENUM ('need_help', 'can_help');
CREATE TYPE public.pin_category AS ENUM ('food', 'medical', 'rescue', 'shelter');

CREATE TABLE public.pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type pin_type NOT NULL,
  category pin_category NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pins" ON public.pins FOR SELECT USING (true);
CREATE POLICY "Anyone can create pins" ON public.pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pins" ON public.pins FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.pins;
