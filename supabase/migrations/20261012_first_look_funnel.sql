-- AARYX First Look guide-request funnel. Isolated from Blueprint tables/routes.
-- Apply in the authorized AARYX Supabase project after review.

create extension if not exists pgcrypto;

create table if not exists public.first_look_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 2 and 80),
  work_email text not null unique check (work_email = lower(work_email) and char_length(work_email) <= 254),
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.first_look_consent_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.first_look_leads(id) on delete cascade,
  marketing_consent boolean not null,
  source_path text not null default '/',
  recorded_at timestamptz not null default now()
);

create table if not exists public.first_look_guide_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  lead_id uuid not null references public.first_look_leads(id) on delete restrict,
  problem_key text not null check (problem_key in ('handoff', 'waiting', 'founder', 'tools')),
  guide_id text not null check (guide_id in ('01-handoff', '02-stalled-work-recovery', '03-founder-bottleneck', '04-disconnected-tools')),
  source_path text not null default '/',
  request_ip_hash text not null,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'accepted', 'failed')),
  delivery_attempt_count integer not null default 0 check (delivery_attempt_count between 0 and 3),
  delivery_provider text,
  delivery_provider_message_id text,
  delivery_accepted_at timestamptz,
  delivery_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (problem_key = 'handoff' and guide_id = '01-handoff') or
    (problem_key = 'waiting' and guide_id = '02-stalled-work-recovery') or
    (problem_key = 'founder' and guide_id = '03-founder-bottleneck') or
    (problem_key = 'tools' and guide_id = '04-disconnected-tools')
  )
);

create index if not exists first_look_guide_requests_lead_id_created_at_idx
  on public.first_look_guide_requests (lead_id, created_at desc);
create index if not exists first_look_guide_requests_ip_created_at_idx
  on public.first_look_guide_requests (request_ip_hash, created_at desc);
create index if not exists first_look_consent_events_lead_id_recorded_at_idx
  on public.first_look_consent_events (lead_id, recorded_at desc);

create or replace function public.first_look_set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists first_look_leads_updated_at on public.first_look_leads;
create trigger first_look_leads_updated_at
before update on public.first_look_leads
for each row execute function public.first_look_set_updated_at();

drop trigger if exists first_look_guide_requests_updated_at on public.first_look_guide_requests;
create trigger first_look_guide_requests_updated_at
before update on public.first_look_guide_requests
for each row execute function public.first_look_set_updated_at();

alter table public.first_look_leads enable row level security;
alter table public.first_look_consent_events enable row level security;
alter table public.first_look_guide_requests enable row level security;
-- No browser-facing policies are created. Server-side service-role requests bypass RLS.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aaryx-private-guides', 'aaryx-private-guides', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];
-- No storage.objects SELECT policy is created. Only server-side service-role code may download PDFs.

create or replace view public.first_look_lead_request_report
with (security_invoker = true) as
select
  r.created_at as requested_at,
  l.first_name,
  l.work_email,
  l.marketing_consent,
  r.problem_key,
  r.guide_id,
  r.source_path,
  r.delivery_status,
  r.delivery_attempt_count,
  r.delivery_provider,
  r.delivery_accepted_at,
  r.delivery_error
from public.first_look_guide_requests r
join public.first_look_leads l on l.id = r.lead_id;

-- Founder read-only reporting query (run through a service-role/admin connection):
-- select * from public.first_look_lead_request_report order by requested_at desc;
