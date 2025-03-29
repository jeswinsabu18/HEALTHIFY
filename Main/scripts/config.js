
import { createClient } from "https://esm.sh/@supabase/supabase-js";
// Your Supabase configuration
export const MONGO_URI = 'mongodb+srv://johnkulangara1077:bijaliya@healthifycluster.ingar.mongodb.net/health_platform?retryWrites=true&w=majority';
export const supabaseUrl = 'https://prkeusllhjfxxbovdqjk.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya2V1c2xsaGpmeHhib3ZkcWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjcyMTgsImV4cCI6MjA1NzEwMzIxOH0.IsHvMd3pslFAucd7aw0y7sMtfflI-hP_oYtfn_-f4nY';
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };