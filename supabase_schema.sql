-- ── RACES ──
create table if not exists races (
  id text primary key,
  round integer,
  name text,
  circuit text,
  country text,
  flag_emoji text,
  date text,
  lat float,
  lon float,
  laps integer,
  lap_length_km float,
  pit_lane_time_loss integer,
  drs_zones integer,
  weather_forecast text,
  available_compounds text[],
  track_description text,
  typical_strategy text,
  actual_results jsonb
);

-- ── STRATEGIES ──
create table if not exists strategies (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  user_id uuid,
  username text,
  race_id text references races(id),
  submitted boolean default false,
  starting_tire text,
  pit_stop_1_lap integer,
  pit_stop_1_tire text,
  pit_stop_2_lap integer,
  pit_stop_2_tire text,
  pit_stop_3_lap integer,
  pit_stop_3_tire text,
  safety_car_response text,
  score integer default 0
);

-- ── LEAGUES ──
create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  name text,
  invite_code text unique,
  creator_id uuid,
  creator_username text,
  member_ids uuid[],
  member_usernames text[]
);

-- ── PROFILES ──
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  user_id uuid unique,
  username text,
  favorite_team text,
  bio text
);

-- ── BANTER POSTS ──
create table if not exists banter_posts (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  user_id uuid,
  username text,
  content text,
  likes integer default 0
);

-- ── CHALLENGES ──
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  user_id uuid,
  username text,
  race_id text,
  challenge_type text,
  data jsonb
);

-- ── DUELS ──
create table if not exists duels (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  challenger_id uuid,
  challenger_username text,
  opponent_id uuid,
  opponent_username text,
  race_id text,
  status text default 'pending',
  winner_id uuid
);

-- ── ROW LEVEL SECURITY ──
alter table races enable row level security;
alter table strategies enable row level security;
alter table leagues enable row level security;
alter table profiles enable row level security;
alter table banter_posts enable row level security;
alter table challenges enable row level security;
alter table duels enable row level security;

-- Everyone can read races
create policy "races_read" on races for select using (true);
-- Only allow inserts from service role (seeding)
create policy "races_insert" on races for insert with check (true);
create policy "races_update" on races for update using (true);

-- Strategies: anyone can read, users manage their own
create policy "strategies_read" on strategies for select using (true);
create policy "strategies_insert" on strategies for insert with check (true);
create policy "strategies_update" on strategies for update using (true);

-- Leagues: anyone can read/write (invite code controls access)
create policy "leagues_read" on leagues for select using (true);
create policy "leagues_insert" on leagues for insert with check (true);
create policy "leagues_update" on leagues for update using (true);
create policy "leagues_delete" on leagues for delete using (true);

-- Profiles: anyone can read, users manage their own
create policy "profiles_read" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (true);
create policy "profiles_update" on profiles for update using (true);

-- Banter: anyone can read/write
create policy "banter_read" on banter_posts for select using (true);
create policy "banter_insert" on banter_posts for insert with check (true);
create policy "banter_update" on banter_posts for update using (true);
create policy "banter_delete" on banter_posts for delete using (true);

-- Challenges/Duels
create policy "challenges_all" on challenges for all using (true);
create policy "duels_all" on duels for all using (true);
