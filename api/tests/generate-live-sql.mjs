import { buildBlueprintSession, buildPayload } from '../../blueprint/logic.js';
import { mapPayloadToSupabaseRow } from '../_lib/blueprint-submission.js';
import fs from 'node:fs';

const answers = {
  q1: 'operations_management',
  q2: 'four_to_seven',
  q3: 'handoffs_or_ownership_gaps',
  q4: 'team_time_and_cleanup_work',
  q5: 'task_system_plus_manual_checking',
  q6: 'team_staying_dependent_on_me',
  q7: 'several_workflows_are_involved',
  q8: 'it_would_help_but_bigger_issue_is_broader',
  q9: 'partly_reliable',
};
const identity = {
  firstName: 'QA-LIVE',
  lastName: 'DELETE-ME',
  email: 'qa.live.blueprint+20260814@example.com',
};
const session = buildBlueprintSession(answers, identity);
const payload = buildPayload(session, {
  assessmentId: '22222222-2222-4222-8222-222222222222',
  submittedAt: '2026-08-14T16:00:00.000Z',
});
const row = mapPayloadToSupabaseRow(payload);

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') {
    const json = JSON.stringify(value).replace(/'/g, "''");
    return `'${json}'::jsonb`;
  }
  const text = String(value).replace(/'/g, "''");
  return `'${text}'`;
}

const columns = Object.keys(row);
const insertSql = `INSERT INTO public.blueprint_submissions (${columns.join(', ')}) VALUES (${columns.map((column) => sqlLiteral(row[column])).join(', ')}) ON CONFLICT (assessment_id) DO NOTHING;`;
const selectSql = `SELECT assessment_id, submitted_at, first_name, last_name, work_email, lead_source, blueprint_role_type, blueprint_people_affecting_next_step, blueprint_biggest_problem, blueprint_first_impact, blueprint_followup_method, blueprint_ninety_day_risk, blueprint_problem_scope, blueprint_visibility_solution_scope, blueprint_followup_consistency, blueprint_breakdown_severity_band, blueprint_primary_problem_class, blueprint_primary_route, blueprint_headline_diagnosis, blueprint_primary_recommendation, blueprint_confidence_band, blueprint_assessment_version, jsonb_typeof(blueprint_raw_payload_json) AS raw_payload_type FROM public.blueprint_submissions WHERE assessment_id = '22222222-2222-4222-8222-222222222222';`;
const deleteSql = `DELETE FROM public.blueprint_submissions WHERE assessment_id = '22222222-2222-4222-8222-222222222222';`;
fs.writeFileSync('/tmp/aaryx_blueprint_live_insert.sql', insertSql);
fs.writeFileSync('/tmp/aaryx_blueprint_live_select.sql', selectSql);
fs.writeFileSync('/tmp/aaryx_blueprint_live_delete.sql', deleteSql);
console.log(JSON.stringify({ row, insertSqlPath: '/tmp/aaryx_blueprint_live_insert.sql', selectSqlPath: '/tmp/aaryx_blueprint_live_select.sql', deleteSqlPath: '/tmp/aaryx_blueprint_live_delete.sql' }, null, 2));
