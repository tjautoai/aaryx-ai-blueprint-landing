-- AARYX AI V1.1 / Supabase read-only preflight
-- Target project only: xiwxprgohdwphgrkyusl
-- Run in Supabase Dashboard > SQL Editor while the selected project is xiwxprgohdwphgrkyusl.
-- This script deliberately returns metadata and aggregate counts only. It selects no Blueprint or lead PII,
-- lists no private object names, and performs no DDL, DML, storage, policy, or configuration change.
-- The transaction is explicitly read-only and always ends with ROLLBACK.

begin transaction read only;
set local statement_timeout = '15s';

-- 0. Target and safety evidence.
select
  current_database() as database_name,
  current_user as execution_role,
  current_setting('transaction_read_only') as transaction_read_only;

-- 1. Exact legacy Blueprint submission count. No row data is selected.
select count(*) as blueprint_submissions_count
from public.blueprint_submissions;

-- 2. Existing public relations relevant to Blueprint and First Look.
select table_schema, table_name, table_type
from information_schema.tables
where table_schema = 'public'
  and (
    table_name = 'blueprint_submissions'
    or table_name in ('first_look_leads', 'first_look_consent_events', 'first_look_guide_requests')
  )
order by table_name;

select table_schema, table_name
from information_schema.views
where table_schema = 'public'
  and table_name = 'first_look_lead_request_report';

-- 3. Existing First Look function and trigger name collisions.
select routine_schema, routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'first_look_set_updated_at';

select event_object_schema, event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name in ('first_look_leads_updated_at', 'first_look_guide_requests_updated_at')
order by table_name, trigger_name;

-- 4. RLS state and policies. Policy expressions contain no row data and are included
-- so a browser-facing storage.objects policy cannot be missed.
select n.nspname as schema_name,
       c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
  and c.relname in ('blueprint_submissions', 'first_look_leads', 'first_look_consent_events', 'first_look_guide_requests')
order by c.relname;

select schemaname as schema_name,
       tablename as table_name,
       policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
from pg_policies
where (schemaname = 'public' and tablename in ('blueprint_submissions', 'first_look_leads', 'first_look_consent_events', 'first_look_guide_requests'))
   or (schemaname = 'storage' and tablename in ('objects', 'buckets'))
order by schemaname, tablename, policyname;

-- 5. Existing target bucket and aggregate object counts only. No object names are selected.
select id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
from storage.buckets
where id = 'aaryx-private-guides';

select count(*) as private_guide_object_count
from storage.objects
where bucket_id = 'aaryx-private-guides';

select b.id, b.name, b.public, count(o.id) as object_count
from storage.buckets b
left join storage.objects o on o.bucket_id = b.id
where b.id ilike '%blueprint%' or b.name ilike '%blueprint%'
group by b.id, b.name, b.public
order by b.id;

rollback;
