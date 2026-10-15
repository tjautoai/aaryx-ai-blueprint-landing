-- AARYX AI V1.1 / post-migration read-only verification
-- Target project only: xiwxprgohdwphgrkyusl
-- Run in Supabase Dashboard > SQL Editor while project xiwxprgohdwphgrkyusl is selected.
-- This script selects metadata and aggregate counts only. It returns no lead,
-- Blueprint, or private-object data and makes no changes.

begin transaction read only;
set local statement_timeout = '15s';

-- 0. Safety and target evidence.
select
  current_database() as database_name,
  current_user as execution_role,
  current_setting('transaction_read_only') as transaction_read_only;

-- 1. Required relations and their security posture.
select
  c.relname as relation_name,
  case c.relkind when 'r' then 'table' when 'v' then 'view' else c.relkind::text end as relation_type,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  c.reloptions as relation_options
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'blueprint_submissions',
    'first_look_leads',
    'first_look_consent_events',
    'first_look_guide_requests',
    'first_look_lead_request_report'
  )
order by c.relname;

-- 2. Effective table/view privileges, including inherited and PUBLIC grants.
with roles(role_name) as (
  values ('anon'::name), ('authenticated'::name), ('service_role'::name)
), relations(relation_name) as (
  values
    ('public.first_look_leads'::text),
    ('public.first_look_consent_events'::text),
    ('public.first_look_guide_requests'::text),
    ('public.first_look_lead_request_report'::text)
), privileges(privilege_type) as (
  values ('select'::text), ('insert'::text), ('update'::text), ('delete'::text)
)
select
  roles.role_name,
  relations.relation_name,
  privileges.privilege_type,
  has_table_privilege(roles.role_name, relations.relation_name, privileges.privilege_type) as effectively_granted
from roles
cross join relations
cross join privileges
order by roles.role_name, relations.relation_name, privileges.privilege_type;

-- 3. Effective execute privilege on the First Look trigger function.
select
  role_name,
  has_function_privilege(role_name, 'public.first_look_set_updated_at()', 'execute') as trigger_function_execute
from (values ('public'::name), ('anon'::name), ('authenticated'::name), ('service_role'::name)) as roles(role_name)
order by role_name;

-- 4. All First Look policies and all storage-object policies with role scopes and predicates.
select
  schemaname as schema_name,
  tablename as table_name,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where (schemaname = 'public' and tablename in (
    'first_look_leads',
    'first_look_consent_events',
    'first_look_guide_requests'
  ))
  or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;

-- 5. Private-bucket configuration and aggregate object count only.
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
from storage.buckets
where id = 'aaryx-private-guides';

select count(*) as private_guide_object_count
from storage.objects
where bucket_id = 'aaryx-private-guides';

-- 6. Legacy preservation evidence. No row data is selected.
select count(*) as blueprint_submissions_count
from public.blueprint_submissions;

rollback;