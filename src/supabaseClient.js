import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zgiclfjzuhgltptounot.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_zkSnXwtvREd0sa5ir3y3yg_bAdr7wWC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
