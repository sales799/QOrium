import Link from 'next/link';

export const dynamic = 'force-static';

export default function CandidatePortalHome() {
  return (
    <main className="portal-shell">
      <section className="portal-panel" aria-labelledby="candidate-portal-title">
        <header className="portal-header">
          <p className="portal-brand">QOrium</p>
          <span className="portal-status">Candidate portal online</span>
        </header>
        <div className="portal-main">
          <p className="portal-kicker">Private assessment entry</p>
          <h1 id="candidate-portal-title" className="portal-title">
            Your test opens from the secure invite link.
          </h1>
          <p className="portal-copy">
            QOrium assessment links are unique to a candidate and role. Open the link shared by your
            recruiter to view the question, submit your answer, and receive the result flow assigned
            to your invitation.
          </p>
          <div className="portal-actions">
            <Link className="portal-button" href="/sessions/00000000-0000-0000-0000-000000000001">
              Open demo session
            </Link>
            <a className="portal-button portal-button-secondary" href="https://qorium.online/">
              Visit QOrium
            </a>
          </div>
          <p className="portal-note" role="status">
            If you expected a test here, use the full invite URL. It usually starts with
            candidate.qorium.online/assessment/. The Wave 3 demo session requires the orchestrator
            on port 5115.
          </p>
        </div>
      </section>
    </main>
  );
}
