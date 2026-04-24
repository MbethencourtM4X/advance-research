export default function DashboardPlan() {
  return (
    <section className="section">
      <h2>📊 Dashboard MVP Plan</h2>
      <div className="highlight">
        <p><strong>Deliverable:</strong> <span className="badge success">Approved</span></p>
        <p>Interactive dashboard to track IDAN agua tenders in real-time</p>
      </div>
      
      <div className="subsection">
        <h3>Features</h3>
        <ul>
          <li>Real-time tender listings (IDAN agua category)</li>
          <li>Advanced filters: Status, deadline, value, requirements</li>
          <li>Tender detail view: Full specs, bid timeline, contacts</li>
          <li>Alert system: New tenders + deadline notifications</li>
          <li>Export: CSV, PDF for analysis</li>
        </ul>
      </div>

      <div className="subsection">
        <h3>Automation</h3>
        <ul>
          <li><strong>Daily Cron:</strong> 06:00 AST (scrape IDAN portal)</li>
          <li><strong>Data Update:</strong> Auto-refresh dashboard</li>
          <li><strong>New Tender Alert:</strong> Email/SMS to Advance</li>
          <li><strong>Analytics:</strong> Tender trends & opportunities</li>
        </ul>
      </div>

      <div className="subsection">
        <h3>Technology Stack</h3>
        <ul>
          <li>Frontend: Next.js + React (modern, responsive)</li>
          <li>Backend: Node.js (scraper + API)</li>
          <li>Database: PostgreSQL (tender data)</li>
          <li>Hosting: Vercel (frontend) + AWS (backend)</li>
        </ul>
      </div>

      <div className="subsection">
        <h3>Timeline</h3>
        <ul>
          <li><strong>Week 1:</strong> Research + Architecture</li>
          <li><strong>Week 2:</strong> Dashboard build + Scraper</li>
          <li><strong>Week 3:</strong> Testing + Deployment</li>
          <li><strong>Week 4:</strong> Launch + Optimization</li>
        </ul>
      </div>
    </section>
  );
}
