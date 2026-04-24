import Header from './components/Header';
import CompanyAnalysis from './components/CompanyAnalysis';
import ResearchFindings from './components/ResearchFindings';
import DashboardPlan from './components/DashboardPlan';
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
