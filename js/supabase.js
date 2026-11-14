import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// =====================================================
// CLASSLINK SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL =
    "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

console.log("ClassLink connected to Supabase!");