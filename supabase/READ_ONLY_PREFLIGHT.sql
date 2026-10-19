-- AARYX V1.1. READ-ONLY PREFLIGHT. Do not modify data or storage.
-- Target must be the authorized AARYX project ref xiwxprgohdwphgrkyusl.
-- Do not run against the Family Calendar project.

-- 1. Legacy Blueprint exact row count only. Do not select personal data.
select count(*) as blueprint_submissions_count from public.blueprint_submissions;

-- 2. Existing First Look names. Any result requires manual review before migration.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('first_look_leads', 'first_look_consent_events', 'first_look_guide_requests')
order by table_name;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'first_look_set_updated_at';

select table_name
from information_schema.views
where table_schema = 'public'
  and table_name = 'first_look_lead_request_report';

-- 3. Existing target storage bucket and object count. Do not list object names.
select id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
from storage.buckets
where id = 'aaryx-private-guides';

select count(*) as private_guide_object_count
from storage.objects
where bucket_id = 'aaryx-private-guides';

-- 4. Existing Blueprint-related storage buckets and object counts.
select b.id, b.name, b.public, count(o.id) as object_count
from storage.buckets b
left join storage.objects o on o.bucket_id = b.id
where b.id ilike '%blueprint%' or b.name ilike '%blueprint%'
group by b.id, b.name, b.public
order by b.id;

-- 5. Review existing First Look trigger names before migration.
select event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name in ('first_look_leads_updated_at', 'first_look_guide_requests_updated_at')
order by table_name, trigger_name;
