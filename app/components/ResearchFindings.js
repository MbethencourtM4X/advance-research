export default function ResearchFindings() {
  return (
    <section className="section">
      <h2>🔬 IDAN Panama Procurement Research</h2>
      <div className="highlight">
        <p><strong>Status:</strong> <span className="badge pending">In Progress</span></p>
        <p>Researcher is analyzing panamacompra.gob.pa and IDAN water tenders</p>
      </div>
      <div className="subsection">
        <h3>Research Focus</h3>
        <ul>
          <li>Portal structure & search methodology</li>
          <li>Active agua (water) tenders RIGHT NOW</li>
          <li>Procurement cycles & timelines</li>
          <li>Scraping strategy & data extraction</li>
        </ul>
      </div>
      <div className="subsection">
        <h3>Next Steps</h3>
        <ul>
          <li>Identify current active IDAN tenders</li>
          <li>Map tender data fields</li>
          <li>Validate scraping approach</li>
          <li>Estimate daily update frequency</li>
        </ul>
      </div>
      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
        <em>Research output: ~/.openclaw/agents/researcher/outputs/idan-panama-research.md</em>
      </p>
    </section>
  );
}
