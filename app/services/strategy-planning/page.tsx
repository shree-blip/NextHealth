import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strategy & Planning for Healthcare | Custom Marketing Roadmaps',
  description: 'Strategic healthcare marketing planning and custom marketing roadmaps aligned with your clinic growth goals. Data-driven strategy for sustainable patient acquisition.',
  keywords: 'healthcare marketing strategy, medical marketing plan, clinic growth strategy, healthcare marketing roadmap',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/services/strategy-planning',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Strategy & Planning",
  "description": "Custom healthcare marketing strategy and planning aligned with clinic growth goals."
};

export default function StrategyPlanningPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        Without strategy, marketing becomes random—ads running everywhere, no clear goals, disappointing results, and wasted budget. Healthcare practices have unique business models, regulatory constraints, and growth objectives that demand customized strategic planning.
      </p>
      <p>
        Our Strategy & Planning service starts with deep discovery: understanding your clinic, competitive landscape, patient demographics, growth ambitions, and budget realities. We conduct market research, competitor analysis, and patient behavior studies to build a comprehensive picture.
      </p>
      <p>
        From this foundation, we develop a detailed 12-month marketing roadmap with clear objectives, channel allocation, budget recommendations, and success metrics. This roadmap guides all other marketing investments, ensuring every dollar works toward unified business goals.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '🔬',
      title: 'Market & Competitor Analysis',
      description: 'Deep research into local market, competitive landscape, and patient behavior patterns.'
    },
    {
      icon: '🎯',
      title: 'Goal Setting & Metrics',
      description: 'Clear, measurable objectives aligned with clinic revenue and growth targets.'
    },
    {
      icon: '📊',
      title: 'Data-Driven Audits',
      description: 'Current marketing performance analysis, gap identification, and optimization opportunities.'
    },
    {
      icon: '🗺️',
      title: 'Strategic Roadmap Creation',
      description: 'Detailed 12-month marketing plan with channel prioritization and budget allocation.'
    },
    {
      icon: '💡',
      title: 'Channel Strategy',
      description: 'Specific recommendations for SEO, Ads, Social, Content, Email, and other channels.'
    },
    {
      icon: '📈',
      title: 'Quarterly Reviews & Optimization',
      description: 'Regular strategic reviews with performance data and course corrections.'
    }
  ];

  const breakdown = [
    {
      title: 'Discovery & Analysis',
      items: [
        'Comprehensive clinic intake: history, services, current marketing efforts, revenue model',
        'Target patient persona development based on existing and ideal patient profiles',
        'Local market research: population demographics, healthcare competition, search volume',
        'Competitive analysis of 5-15 competing clinics identifying their marketing strategies',
        'Strengths, Weaknesses, Opportunities, Threats (SWOT) analysis for your clinic',
        'Current marketing performance audit (organic traffic, ad spend, conversion rates)',
        'Patient journey mapping from awareness through appointment and beyond'
      ]
    },
    {
      title: 'Strategic Planning',
      items: [
        'Clear goal setting: patient acquisition targets, revenue goals, market share objectives',
        'Channel prioritization: ranking SEO, Ads, Social, Content, Email by impact potential',
        'Service-specific strategy: differentiation for competing services offered',
        'Seasonal planning: identifying peak and slow periods and corresponding strategies',
        'Geographic strategy: service area prioritization and multi-location coordination',
        'Brand positioning: unique value proposition and differentiation strategy',
        'Competitive response planning: how to compete against established players'
      ]
    },
    {
      title: 'Marketing Roadmap Development',
      items: [
        '12-month detailed roadmap with monthly objectives and key milestones',
        'Channel-specific tactics: what specific initiatives in each marketing channel',
        'Timeline and sequencing: optimal order and timing for implementing tactics',
        'Budget allocation: recommended spend across channels based on market analysis',
        'Team requirements: internal staffing and external partner roles needed',
        'Technology stack recommendations: essential marketing tools and platforms',
        'Key performance indicators (KPIs) and success metrics for each channel'
      ]
    },
    {
      title: 'Ongoing Strategy Management',
      items: [
        'Monthly performance tracking against roadmap objectives',
        'Quarterly strategic reviews analyzing results and adjusting tactics',
        'Competitive intelligence monitoring for market changes',
        'Emerging opportunity identification (new platforms, technologies, strategies)',
        'Budget optimization based on actual performance data',
        'Annual strategic planning for next fiscal year',
        'Executive reporting and stakeholder communication'
      ]
    }
  ];

  const benefits = [
    'Eliminate marketing guesswork with data-driven strategic planning',
    'Coordinate all marketing efforts toward unified, measurable business goals',
    'Optimize budget allocation ensuring maximum ROI on marketing spend',
    'Identify hidden opportunities and competitive threats in your market',
    'Create accountability with clear KPIs and monthly performance tracking',
    'Adapt quickly to market changes with built-in quarterly review process',
    'Scale sustainably with strategic foundation supporting long-term growth'
  ];

  const faqs = [
    {
      q: 'How long does strategic planning take?',
      a: 'The initial planning phase typically takes 2-4 weeks depending on clinic complexity and data availability. We need time for research, competitive analysis, and stakeholder interviews. Once the initial plan is created, we transition to quarterly reviews (1-2 weeks each) for ongoing optimization and adjustment.'
    },
    {
      q: 'Should we use an internal marketing person or marketing partner?',
      a: 'Depends on your size and complexity. Larger clinics ($5M+ revenue) often benefit from internal marketing leadership plus marketing specialists. Smaller clinics are more cost-efficient with a firm managing everything. We\'ve helped clinics set up internal teams with partner oversight (hybrid model). The strategy should drive this decision.'
    },
    {
      q: 'How do we measure if strategy is working?',
      a: 'We establish clear baseline metrics (current patient acquisition cost, lifetime value, market share) and specific goals for 90 days, 6 months, and 12 months. Monthly dashboards track key metrics. Quarterly reviews compare actual results to projections. We focus on business outcomes (appointments booked, revenue) not vanity metrics.'
    },
    {
      q: 'What if market conditions change mid-year?',
      a: 'Good strategies are flexible. We build quarterly review checkpoints specifically for adjusting to market changes. If a competitor suddenly launches aggressive marketing, we can quickly adjust. If a new platform emerges, we can allocate test budget. The roadmap is a guide, not concrete, allowing for real-time optimization.'
    },
    {
      q: 'How much should a clinic budget for marketing?',
      a: 'Healthcare industry benchmarks suggest 2-5% of revenue for marketing. A clinic generating $2M in revenue should budget $40-100K annually on marketing. This varies by market competitiveness and growth ambitions—competitive urban markets might justify higher spend. We\'ll recommend specific budget based on your goals and market position.'
    },
    {
      q: 'Can we implement the roadmap ourselves?',
      a: 'Some clinics do, but most find working with a firm more effective. Implementing a comprehensive marketing strategy requires specialized skills (SEO, paid ads, content creation, analytics). We recommend a hybrid approach: we recommend strategy, you execute some tactics with support, we execute specialized tactics. We\'ll outline internal vs. partner roles in the roadmap.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="Strategy & Planning"
        excerpt="Custom healthcare marketing roadmaps aligned with your practice growth goals. Data-driven strategic planning for sustainable, predictable patient acquisition."
        image="/6.png"
        overview={content}
        coreFeatures={coreFeatures}
        breakdown={breakdown}
        faqs={faqs}
        benefits={benefits}
      />
      <Footer />
    </main>
  );
}
