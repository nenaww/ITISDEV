const SUPABASE_URL = "https://ukcagpoohqrfnbfkyoyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Dw-2D5OsxBftqNRNNIflTw_8Ech1hb_";

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);