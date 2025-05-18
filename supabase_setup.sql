-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  nombre TEXT,
  rol TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de mensajes para el chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('client', 'assistant', 'senior', 'supervisor', 'manager')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  model TEXT DEFAULT 'mock',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);

-- Políticas de seguridad para usuarios
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own data" ON public.users
  FOR ALL 
  TO authenticated
  USING (auth.uid() = id);
  
-- Políticas de seguridad para mensajes
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Crear bucket para archivos si no existe
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, avif_autodetection)
  VALUES ('chat-files', 'Chat Files', false, false)
  ON CONFLICT DO NOTHING;
END $$;

-- Políticas de seguridad para el bucket
CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT 
  TO authenticated
  USING (
    bucket_id = 'chat-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Crear función para actualizar last_login al iniciar sesión
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE
  SET last_login = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función después de auth.sign_in
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 