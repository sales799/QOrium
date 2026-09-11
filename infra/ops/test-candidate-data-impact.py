"""Synthetic integration test: requires Docker and a local postgres:16-alpine image.
Creates/removes only its uniquely named disposable container and anonymous volume.
"""
import json
import os
from pathlib import Path
import secrets
import subprocess
import uuid

IMAGE = "postgres:16-alpine"
NAME = "qorium-impact-test-" + uuid.uuid4().hex
TENANT = "11111111-1111-4111-8111-111111111111"
INVITE = "22222222-2222-4222-8222-222222222222"
OTHER = "33333333-3333-4333-8333-333333333333"
ATTEMPT = "44444444-4444-4444-8444-444444444444"
ANSWER = "55555555-5555-4555-8555-555555555555"
UNLINKED = "66666666-6666-4666-8666-666666666666"
script = Path(__file__).with_name("candidate-data-impact.sql").read_text()


def sql(text, tenant=TENANT, invitation=INVITE, check=True):
    return subprocess.run(
        ["docker", "exec", "-i", NAME, "psql", "-X", "-qAt", "-U", "postgres",
         "-v", "ON_ERROR_STOP=1", "-v", "tenant_id=" + tenant,
         "-v", "invitation_id=" + invitation],
        input=text, text=True, capture_output=True, check=check,
    ).stdout


subprocess.run(["docker", "image", "inspect", IMAGE], check=True, stdout=subprocess.DEVNULL)
created = False
try:
    env = dict(os.environ, POSTGRES_PASSWORD=secrets.token_urlsafe(32))
    subprocess.run(["docker", "run", "-d", "--name", NAME,
                    "--label", "qorium.nirantar=disposable-test", "--memory=512m", "--cpus=1",
                    "-e", "POSTGRES_PASSWORD", IMAGE], env=env, check=True, stdout=subprocess.DEVNULL)
    created = True
    import time
    for _ in range(30):
        ready = subprocess.run(["docker", "exec", NAME, "pg_isready", "-U", "postgres"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if ready.returncode == 0:
            break
        time.sleep(1)
    else:
        raise RuntimeError("Disposable PostgreSQL did not become ready")
    sql(f"""
      CREATE SCHEMA content; CREATE SCHEMA audit; CREATE SCHEMA app;
      CREATE TABLE content.invitations(id uuid, tenant_id uuid, expires_at timestamptz);
      CREATE TABLE content.attempts(id uuid, tenant_id uuid, invitation_id uuid, candidate_id text);
      CREATE TABLE content.responses(id uuid, tenant_id uuid, attempt_id uuid, candidate_id text);
      CREATE TABLE content.grade_decisions(tenant_id uuid, response_id uuid);
      CREATE TABLE audit.events(tenant_id uuid, entity_id text);
      CREATE TABLE app.audit_export_jobs(tenant_id uuid, expires_at timestamptz, content bytea);
      INSERT INTO content.invitations VALUES ('{INVITE}','{TENANT}',now()-interval '1 day');
      INSERT INTO content.attempts VALUES ('{ATTEMPT}','{TENANT}','{INVITE}','cand_{INVITE}');
      INSERT INTO content.responses VALUES ('{ANSWER}','{TENANT}','{ATTEMPT}','cand_{INVITE}'),
        ('{UNLINKED}','{TENANT}',null,'cand_{INVITE}'),
        ('{OTHER}','{OTHER}','{ATTEMPT}','cand_{INVITE}');
      INSERT INTO content.grade_decisions VALUES ('{TENANT}','{ANSWER}'),('{OTHER}','{ANSWER}');
      INSERT INTO audit.events VALUES ('{TENANT}','{INVITE}'),('{OTHER}','{INVITE}'),(null,'{INVITE}');
      INSERT INTO app.audit_export_jobs VALUES ('{TENANT}',now()-interval '1 day','synthetic'),
        ('{TENANT}',now()+interval '1 day','synthetic'),('{OTHER}',now()-interval '1 day','synthetic');
    """)
    expected = dict(mode="read_only_impact_inventory", invitation_found=True,
                    invitation_expired=True, attempts=1, responses=2, responses_without_attempt=1,
                    grade_decisions=1, direct_entity_audit_events=1,
                    tenant_export_jobs_requiring_review=2, expired_tenant_exports_with_content=1,
                    scope_complete=False)
    assert json.loads(sql(script)) == expected
    for tenant, invitation in [(OTHER, INVITE), (TENANT, OTHER)]:
        result = json.loads(sql(script, tenant, invitation))
        assert result["invitation_found"] is False
        assert result["invitation_expired"] is None
        assert all(result[key] == 0 for key in expected if isinstance(expected[key], int)
                   and not isinstance(expected[key], bool))
    before = sql("SELECT count(*) FROM content.responses")
    try:
        sql(script.replace("WITH target AS (", "DELETE FROM content.responses;\nWITH target AS (", 1))
    except subprocess.CalledProcessError as exc:
        assert "read-only transaction" in exc.stderr
    else:
        raise AssertionError("Read-only transaction accepted mutation")
    assert sql("SELECT count(*) FROM content.responses") == before
    try:
        sql(script, tenant="invalid-uuid")
    except subprocess.CalledProcessError:
        pass
    else:
        raise AssertionError("Invalid input did not fail")
    print("PASS: linked/unlinked counts, tenant isolation, absent target, read-only enforcement, invalid UUID")
finally:
    if created:
        label = subprocess.check_output(["docker", "inspect", "--format",
            '{{ index .Config.Labels "qorium.nirantar" }}', NAME], text=True).strip()
        if label != "disposable-test":
            raise RuntimeError("Refusing cleanup: ownership label changed")
        subprocess.run(["docker", "rm", "-fv", NAME], check=True, stdout=subprocess.DEVNULL)
        print("Owned disposable PostgreSQL container and volume removed")
