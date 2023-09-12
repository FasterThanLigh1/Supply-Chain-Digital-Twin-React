const { createClient } = require("@supabase/supabase-js");

const REACT_APP_SUPABASE_URL = "https://yfglzchwttkotbtjhmnl.supabase.co";
const REACT_APP_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x6Y2h3dHRrb3RidGpobW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc0MTQxMjcsImV4cCI6MjAwMjk5MDEyN30.K0EXVA8ele2aDAH5U5dUI8nw2UCkMLooAg7I4L4LlSg";

const supabaseUrl = REACT_APP_SUPABASE_URL;
const supabaseKey = REACT_APP_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  supabase,
};
