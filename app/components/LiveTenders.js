export default function LiveTenders() {
  return (
    <section className="section" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ff6b6b' }}>
      <h2>🔥 LIVE: IDAN Panama Active Water Tenders</h2>
      <div className="highlight" style={{ backgroundColor: '#fff9e6' }}>
        <p><strong>Status:</strong> <span className="badge urgent">Scraping Now</span></p>
        <p>Pulling all active agua (water) tenders from panamacompra.gob.pa for IDAN...</p>
      </div>
      
      <div className="subsection">
        <h3>📊 Summary</h3>
        <ul>
          <li>Entity: IDAN (Instituto de Acueductos y Alcantarillados Nacionales)</li>
          <li>Category: Agua / Water Services</li>
          <li>Status: Active & Open for Bidding</li>
          <li>Updated: Live scrape in progress</li>
        </ul>
      </div>

      <div className="subsection">
        <h3>💼 Ready to Bid?</h3>
        <p style={{ fontSize: '1.1rem', color: '#ff6b6b', fontWeight: 'bold' }}>
          Here are ALL the water tenders available right now.
        </p>
        <p>
          Want to participate? We can help you track deadlines, prepare bids, and manage your pipeline.
        </p>
      </div>

      <div className="highlight" style={{ backgroundColor: '#e8f5e9' }}>
        <p><strong>Next Step:</strong> Click any tender below for full details & bid requirements</p>
      </div>

      <div className="subsection">
        <h3>🎯 Tenders Table</h3>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          <em>Results loading from panamacompra.gob.pa...</em>
        </p>
        <p style={{ fontSize: '0.9rem', color: '#999' }}>
          (Tender data will appear here once scrape completes)
        </p>
      </div>
    </section>
  );
}
