import { createClient } from '@supabase/supabase-js';

// Lê as credenciais do ficheiro .env criado na raiz do teu projeto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cliente Supabase padrão para Web.
 * Como estamos na Web, ele usa automaticamente o localStorage do navegador.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);