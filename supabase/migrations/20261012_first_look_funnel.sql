-- AARYX First Look guide-request funnel. Isolated from Blueprint tables/routes.
-- Target project: xiwxprgohdwphgrkyusl. Run as one script in Supabase SQL Editor.
-- This migration is intentionally fail-closed: it aborts before DDL if the legacy Blueprint
-- table is absent, any First Look relation/function/trigger already exists, the target bucket
-- already exists, or a pre-existing browser-facing storage.objects policy needs human review.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $$
begin
  if to_regclass('public.blueprint_submissions') is null then
    raise exception 'Expected legacy table public.blueprint_submissions is absent. Aborting without changes.';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('first_look_leads', 'first_look_consent_events', 'first_look_guide_requests', 'first_look_lead_request_report')
  ) then
    raise exception 'A First Look table or view already exists. Aborting without overwrite.';
  end if;

  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'first_look_set_updated_at'
  ) then
    raise exception 'First Look function already exists. Aborting without overwrite.';
  end if;

  if exists (
    select 1
    from information_schema.triggers
    where trigger_schema = 'public'
      and trigger_name in ('first_look_leads_updated_at', 'first_look_guide_requests_updated_at')
  ) then
    raise exception 'First Look trigger already exists. Aborting without overwrite.';
  end if;

  if exists (select 1 from storage.buckets where id = 'aaryx-private-guides') then
    raise exception 'Bucket aaryx-private-guides already exists. Aborting without altering it.';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and roles && array['public', 'anon', 'authenticated']::name[]
      and cmd in ('SELECT', 'ALL')
  ) then
    raise exception 'A browser-facing storage.objects SELECT/ALL policy exists. Review it before creating the private guide bucket.';
  end if;
end;
$$;

create extension if not exists pgcrypto;

create table public.first_look_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 2 and 80),
  work_email text not null unique check (work_email = lower(work_email) and char_length(work_email) <= 254),
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.first_look_consent_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.first_look_leads(id) on delete cascade,
  marketing_consent boolean not null,
  source_path text not null default '/',
  recorded_at timestamptz not null default now()
);

create table public.first_look_guide_requests (
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

create index first_look_guide_requests_lead_id_created_at_idx
  on public.first_look_guide_requests (lead_id, created_at desc);
create index first_look_guide_requests_ip_created_at_idx
  on public.first_look_guide_requests (request_ip_hash, created_at desc);
create index first_look_consent_events_lead_id_recorded_at_idx
  on public.first_look_consent_events (lead_id, recorded_at desc);

create function public.first_look_set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger first_look_leads_updated_at
before update on public.first_look_leads
for each row execute function public.first_look_set_updated_at();

create trigger first_look_guide_requests_updated_at
before update on public.first_look_guide_requests
for each row execute function public.first_look_set_updated_at();

alter table public.first_look_leads enable row level security;
alter table public.first_look_consent_events enable row level security;
alter table public.first_look_guide_requests enable row level security;

-- Explicitly deny browser roles. service_role retains the server-only API path; postgres remains owner/admin.
revoke all on table public.first_look_leads, public.first_look_consent_events, public.first_look_guide_requests from public, anon, authenticated;
grant select, insert, update on table public.first_look_leads, public.first_look_consent_events, public.first_look_guide_requests to service_role;
revoke all on function public.first_look_set_updated_at() from public, anon, authenticated;
grant execute on function public.first_look_set_updated_at() to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aaryx-private-guides', 'aaryx-private-guides', false, 10485760, array['application/pdf']);
-- No storage.objects policy is created. With the bucket private and no browser-facing object
-- SELECT/ALL policy permitted by the guard above, PDFs remain server/admin-only.

create view public.first_look_lead_request_report
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

revoke all on table public.first_look_lead_request_report from public, anon, authenticated;
grant select on table public.first_look_lead_request_report to service_role;

commit;

-- Post-commit verification. Metadata and aggregate counts only. No PII is selected.
begin transaction read only;

select c.relname as relation_name,
       c.relkind as relation_kind,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('blueprint_submissions', 'first_look_leads', 'first_look_consent_events', 'first_look_guide_requests', 'first_look_lead_request_report')
order by c.relname;

select role_name,
       has_table_privilege(role_name, 'public.first_look_leads', 'select,insert,update,delete') as leads_any_dml,
       has_table_privilege(role_name, 'public.first_look_consent_events', 'select,insert,update,delete') as consent_any_dml,
       has_table_privilege(role_name, 'public.first_look_guide_requests', 'select,insert,update,delete') as requests_any_dml,
       has_table_privilege(role_name, 'public.first_look_lead_request_report', 'select') as report_select,
       has_function_privilege(role_name, 'public.first_look_set_updated_at()', 'execute') as trigger_function_execute
from (values ('anon'::name), ('authenticated'::name), ('service_role'::name)) as roles(role_name)
order by role_name;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename in ('first_look_leads', 'first_look_consent_events', 'first_look_guide_requests'))
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'aaryx-private-guides';

select count(*) as private_guide_object_count
from storage.objects
where bucket_id = 'aaryx-private-guides';

select count(*) as blueprint_submissions_count
from public.blueprint_submissions;

rollback;

-- Founder reporting query. Run only through a service-role/admin connection:
-- select * from public.first_look_lead_request_report order by requested_at desc;
