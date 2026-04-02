import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmhozjqqndwcnyevxhob.supabase.co'
const supabaseAnonKey = 'sb_publishable_Q_0xsSIRRkW6x2ZCaSHZ-A_h5-IjNUu'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
