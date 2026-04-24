import Header from './components/Header';
import CompanyAnalysis from './components/CompanyAnalysis';
import ResearchFindings from './components/ResearchFindings';
import DashboardPlan from './components/DashboardPlan';
import DemoTendersTable from "./components/DemoTendersTable";
import Footer from './components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <section className="container">
        <CompanyAnalysis />
        <ResearchFindings />
        <DashboardPlan />
      </section>
      <Footer />
    </main>
  );
}

// Add to imports
import LiveTenders from './components/LiveTenders';

// Add to Home component JSX before Footer:
<LiveTenders />
      <DemoTendersTable />
