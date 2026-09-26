import { createClient } from '@supabase/supabase-js';

// Public anon key — safe for client-side use, RLS restricts it to
// read-only on grid_cells/zone_stats and insert-only on scenario_runs.
const SUPABASE_URL = 'https://uotphaggfquhejfeknre.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdHBoYWdnZnF1aGVqZmVrbnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDk1NDksImV4cCI6MjEwNTkyNTU0OX0.lHl81kdFx-S6ACWHZs7ydqv9t3IdGz1UaFf64woiuzU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);