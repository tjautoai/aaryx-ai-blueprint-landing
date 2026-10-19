-- AARYX AI V1.1 / remaining post-migration security gate
-- Target project only: xiwxprgohdwphgrkyusl
-- Read-only. Returns one PASS/FAIL result set; no PII, object names, DDL, DML, or configuration changes.

begin transaction read only;
set local statement_timeout = '15s';

with
required_relations(relation_name, expected_kind) as (
  values
    ('first_look_leads'::text, 'r'::"char"),
    ('first_look_consent_events'::text, 'r'::"char"),
    ('first_look_guide_requests'::text, 'r'::"char"),
    ('first_look_lead_request_report'::text, 'v'::"char")
),
browser_roles(role_name) as (
  values ('anon'::name), ('authenticated'::name)
),
first_look_relations(relation_name) as (
  values
    ('public.first_look_leads'::text),
    ('public.first_look_consent_events'::text),
    ('public.first_look_guide_requests'::text),
    ('public.first_look_lead_request_report'::text)
),
dml_privileges(privilege_type) as (
  values ('select'::text), ('insert'::text), ('update'::text), ('delete'::text)
),
table_relations(relation_name) as (
  values
    ('public.first_look_leads'::text),
    ('public.first_look_consent_events'::text),
    ('public.first_look_guide_requests'::text)
)
select check_name,
       case when passed then 'PASS' else 'FAIL' end as result,
       detail
from (
  select
    'required_relations_exist' as check_name,
    (
      select count(*) = 4
      from required_relations rr
      join pg_class c on c.relname = rr.relation_name and c.relkind = rr.expected_kind
      join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    ) as passed,
    'Three First Look tables and one reporting view must exist.' as detail

  union all

  select
    'rls_enabled_on_all_first_look_tables',
    (
      select count(*) = 3 and bool_and(c.relrowsecurity)
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relname in ('first_look_leads', 'first_look_consent_events', 'first_look_guide_requests')
    ),
    'RLS must be enabled on every First Look table.'

  union all

  select
    'reporting_view_uses_security_invoker',
    coalesce((
      select 'security_invoker=true' = any(coalesce(c.reloptions, array[]::text[]))
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'first_look_lead_request_report'
        and c.relkind = 'v'
    ), false),
    'The reporting view must use security_invoker=true.'

  union all

  select
    'browser_roles_have_no_effective_relation_privileges',
    not exists (
      select 1
      from browser_roles br
      cross join first_look_relations fr
      cross join dml_privileges dp
      where has_table_privilege(br.role_name, fr.relation_name, dp.privilege_type)
    ),
    'anon and authenticated must have no effective SELECT, INSERT, UPDATE, or DELETE privilege on First Look tables or the report view.'

  union all

  select
    'service_role_has_required_table_and_view_privileges',
    (
      not exists (
        select 1
        from table_relations tr
        cross join (values ('select'::text), ('insert'::text), ('update'::text)) required(privilege_type)
        where not has_table_privilege('service_role', tr.relation_name, required.privilege_type)
      )
      and has_table_privilege('service_role', 'public.first_look_lead_request_report', 'select')
    ),
    'service_role must have SELECT/INSERT/UPDATE on each First Look table and SELECT on the report view.'

  union all

  select
    'trigger_function_execute_is_service_role_only',
    (
      has_function_privilege('service_role', 'public.first_look_set_updated_at()', 'execute')
      and not has_function_privilege('anon', 'public.first_look_set_updated_at()', 'execute')
      and not has_function_privilege('authenticated', 'public.first_look_set_updated_at()', 'execute')
    ),
    'Only service_role may execute first_look_set_updated_at().'

  union all

  select
    'no_browser_role_first_look_rls_policies',
    not exists (
      select 1
      from pg_policies p
      where p.schemaname = 'public'
        and p.tablename in ('first_look_leads', 'first_look_consent_events', 'first_look_guide_requests')
        and p.roles && array['public', 'anon', 'authenticated']::name[]
    ),
    'No browser-facing RLS policy may exist on First Look tables.'

  union all

  select
    'private_bucket_configuration',
    exists (
      select 1
      from storage.buckets b
      where b.id = 'aaryx-private-guides'
        and b.public = false
        and b.file_size_limit = 10485760
        and b.allowed_mime_types = array['application/pdf']::text[]
    ),
    'Bucket must be private, limited to 10 MiB, and allow only application/pdf.'

  union all

  select
    'no_browser_read_or_all_storage_policy',
    not exists (
      select 1
      from pg_policies p
      where p.schemaname = 'storage'
        and p.tablename = 'objects'
        and p.roles && array['public', 'anon', 'authenticated']::name[]
        and p.cmd in ('SELECT', 'ALL')
    ),
    'Fail closed: any browser-role storage.objects SELECT or ALL policy requires review before private-guide upload.'
) checks
order by check_name;

rollback;