-- AARYX AI V1.1 / uploaded private-guide verification
-- Target project only: xiwxprgohdwphgrkyusl
-- Read-only. Returns object metadata only. No file bytes, lead data, object mutation, or policy change.

begin transaction read only;
set local statement_timeout = '15s';

-- 1. Exact required objects, byte sizes, and MIME types.
with expected(name, expected_size) as (
  values
    ('first-fix/01-the-handoff-fix-guide.pdf'::text, 273935::bigint),
    ('first-fix/02-the-stalled-work-recovery-guide.pdf'::text, 272914::bigint),
    ('first-fix/03-the-founder-bottleneck-fix-guide.pdf'::text, 279336::bigint),
    ('first-fix/04-the-disconnected-tools-fix-guide.pdf'::text, 284207::bigint)
), objects as (
  select
    o.name,
    coalesce(nullif(o.metadata ->> 'size', '')::bigint, -1) as byte_size,
    coalesce(o.metadata ->> 'mimetype', '') as mime_type,
    o.created_at,
    o.updated_at
  from storage.objects o
  where o.bucket_id = 'aaryx-private-guides'
    and o.name like 'first-fix/%'
)
select
  e.name as expected_object,
  case when o.name is not null then 'PASS' else 'FAIL' end as exists_result,
  case when o.byte_size = e.expected_size then 'PASS' else 'FAIL' end as size_result,
  case when o.mime_type = 'application/pdf' then 'PASS' else 'FAIL' end as mime_result,
  o.byte_size,
  o.mime_type,
  o.created_at,
  o.updated_at
from expected e
left join objects o on o.name = e.name
order by e.name;

-- 2. Four objects only and no unexpected object under first-fix/.
with expected(name) as (
  values
    ('first-fix/01-the-handoff-fix-guide.pdf'::text),
    ('first-fix/02-the-stalled-work-recovery-guide.pdf'::text),
    ('first-fix/03-the-founder-bottleneck-fix-guide.pdf'::text),
    ('first-fix/04-the-disconnected-tools-fix-guide.pdf'::text)
), objects as (
  select o.name
  from storage.objects o
  where o.bucket_id = 'aaryx-private-guides'
    and o.name like 'first-fix/%'
)
select
  case when count(*) = 4 then 'PASS' else 'FAIL' end as exact_first_fix_object_count,
  count(*) as first_fix_object_count,
  case when count(*) filter (where name not in (select name from expected)) = 0 then 'PASS' else 'FAIL' end as no_unexpected_first_fix_objects,
  count(*) filter (where name not in (select name from expected)) as unexpected_object_count
from objects;

-- 3. Reconfirm private bucket settings. The prior 9/9 security gate remains the access-control evidence.
select
  case when exists (
    select 1 from storage.buckets
    where id = 'aaryx-private-guides'
      and public = false
      and file_size_limit = 10485760
      and allowed_mime_types = array['application/pdf']::text[]
  ) then 'PASS' else 'FAIL' end as private_bucket_configuration;

rollback;

-- SHA-256 cannot be proven from storage object metadata alone.
-- To verify integrity, download each object with authorized Dashboard access and compare locally:
-- sha256sum <downloaded-file>
-- against releases/v1.1/FIRST_LOOK_GUIDE_UPLOAD_MANIFEST.md.