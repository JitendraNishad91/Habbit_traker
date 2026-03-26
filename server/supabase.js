const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gggaxtzdtlefkklmhtgh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZ2F4dHpkdGxlZmtrbG1odGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTc0NzgsImV4cCI6MjA5MDA3MzQ3OH0.gxvIQsHbjGyul9wG5dkvLQraqQeVBUhqJAW5q7Ke_sc';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
