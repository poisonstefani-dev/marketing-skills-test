export interface FundamentalsQuestion {
  id: string;
  concept: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export const FUNDAMENTALS: FundamentalsQuestion[] = [
  // ── Brand & Strategy ──────────────────────────────────────────────────────
  {
    id: 'brand-positioning',
    concept: 'Brand Strategy',
    question: 'Brand positioning defines:',
    options: [
      'The price tier at which a brand competes in its category',
      'How a brand wants to be perceived in a target customer\'s mind relative to competitors',
      'The social channels a brand prioritises for communication',
      'The geographic markets a brand has chosen to enter',
    ],
    correctIndex: 1,
    explanation: 'Positioning is a mental space claim — the specific, differentiated place your brand occupies in the customer\'s mind compared with alternatives.',
  },
  {
    id: 'market-penetration',
    concept: 'Growth Strategy',
    question: 'Market penetration as a growth strategy (Ansoff Matrix) means:',
    options: [
      'Launching an existing product into a new geographic market',
      'Developing a new product for your current customers',
      'Selling more of an existing product to an existing market',
      'Acquiring a competitor to absorb their market share',
    ],
    correctIndex: 2,
    explanation: 'Penetration (quadrant 1 of Ansoff) is the lowest-risk growth move: same product, same market, higher share. It relies on pricing, promotion, distribution, or usage increase.',
  },
  {
    id: 'omnichannel',
    concept: 'Channel Strategy',
    question: 'Omnichannel marketing differs from multichannel marketing primarily because:',
    options: [
      'It uses a higher number of channels simultaneously',
      'Channels are integrated so the customer experience is seamless regardless of touchpoint',
      'It focuses exclusively on digital-owned channels',
      'It requires a centralised media buying team',
    ],
    correctIndex: 1,
    explanation: 'Multichannel = present everywhere. Omnichannel = connected everywhere. In omnichannel, a customer can start on Instagram, research on web, buy in-store, and return via app — with one continuous context.',
  },
  {
    id: 'esov',
    concept: 'Media Investment',
    question: 'A brand holds 12% market share but invests to reach 22% Share of Voice. The 10-point surplus is called:',
    options: [
      'Brand equity premium',
      'Excess Share of Voice (ESOV)',
      'Reach multiplier',
      'SOV index',
    ],
    correctIndex: 1,
    explanation: 'ESOV = SOV − market share. Binet & Field\'s research across thousands of campaigns shows that positive ESOV consistently predicts market share growth at roughly 0.5 share points per +10 ESOV points per year.',
  },
  {
    id: 'share-of-voice',
    concept: 'Media Investment',
    question: 'Share of Voice (SOV) measures:',
    options: [
      'Unprompted brand recall among your target audience',
      'Your brand\'s share of total advertising spend within its category',
      'The ratio of positive to negative brand mentions online',
      'Your share of organic search impressions vs competitors',
    ],
    correctIndex: 1,
    explanation: 'SOV = your ad spend ÷ total category ad spend. It predicts long-run market share direction — the brand outspending its current share grows; the brand underspending declines.',
  },

  // ── Digital Performance ───────────────────────────────────────────────────
  {
    id: 'cac',
    concept: 'Growth Economics',
    question: 'Customer Acquisition Cost (CAC) is correctly calculated as:',
    options: [
      'Total revenue divided by total customers',
      'Total paid ad spend divided by new customers from paid ads',
      'Total sales and marketing spend divided by new customers acquired in the same period',
      'Cost per click multiplied by on-site conversion rate',
    ],
    correctIndex: 2,
    explanation: 'CAC must include all sales AND marketing costs (headcount, tools, agencies, ad spend) and divide by only new customers, not your whole base. Undercosting CAC by excluding salaries is one of the most common unit economics mistakes.',
  },
  {
    id: 'ltv',
    concept: 'Growth Economics',
    question: 'Customer Lifetime Value (LTV) is most strategically useful when:',
    options: [
      'Tracked as a standalone month-on-month KPI',
      'Compared against CAC to assess whether acquisition economics are sustainable',
      'Calculated from the first 30 days of purchase behaviour only',
      'Used to set the retail price of a product',
    ],
    correctIndex: 1,
    explanation: 'LTV alone is just a number. LTV:CAC (target ≥3:1 for most subscription businesses) tells you whether your growth model is profitable at scale. A 1:1 ratio means you break even on acquiring a customer — before any operating costs.',
  },
  {
    id: 'attribution',
    concept: 'Analytics',
    question: 'Last-click attribution systematically undervalues:',
    options: [
      'Branded search and direct traffic',
      'Upper-funnel channels like awareness video, display, and social content',
      'Retargeting and remarketing audiences',
      'Email nurture sequences',
    ],
    correctIndex: 1,
    explanation: 'Last-click gives 100% of conversion credit to the final touchpoint. Channels that build awareness and demand — but don\'t close — look worthless. This causes brands to cut the very spend that creates future demand.',
  },
  {
    id: 'cro',
    concept: 'Conversion',
    question: 'Conversion Rate Optimisation (CRO) focuses on:',
    options: [
      'Increasing total traffic volume through paid channels to grow absolute conversions',
      'Improving the percentage of existing visitors who complete a desired action',
      'Optimising ad creative to improve click-through rate',
      'Reducing CPC across paid search campaigns',
    ],
    correctIndex: 1,
    explanation: 'CRO extracts more value from traffic you already have. Doubling conversion rate has the same revenue impact as doubling traffic — but typically at a fraction of the cost.',
  },
  {
    id: 'funnel-stages',
    concept: 'Funnel Strategy',
    question: 'A comparison page ("Brand X vs Brand Y") and a free trial CTA are best described as:',
    options: [
      'TOFU — designed to reach a wide audience with low intent',
      'MOFU — designed to educate and build consideration',
      'BOFU — designed to convert an audience actively evaluating options',
      'Retention content — designed for existing customers',
    ],
    correctIndex: 2,
    explanation: 'BOFU content targets people who already know the category and are choosing between specific options. Comparisons, demos, pricing, trials, and testimonials all live here.',
  },

  // ── Metrics & Measurement ─────────────────────────────────────────────────
  {
    id: 'north-star',
    concept: 'Product Growth',
    question: 'A good North Star Metric should:',
    options: [
      'Be the metric with the largest absolute value to signal scale to investors',
      'Capture the core value delivered to customers and predict long-term sustainable revenue',
      'Rotate quarterly to reflect shifting business priorities',
      'Be set by the finance team based on revenue targets',
    ],
    correctIndex: 1,
    explanation: 'North Star candidates: Airbnb → nights booked, Spotify → listening time, Slack → messages sent. Each captures genuine value delivery, not just activity. Vanity metrics (app downloads, registered users) fail this test.',
  },
  {
    id: 'churn',
    concept: 'Retention',
    question: 'A SaaS business starts the month with 2,000 customers and loses 100 by month end. Its monthly churn rate is:',
    options: [
      '0.5%',
      '5%',
      '10%',
      '2%',
    ],
    correctIndex: 1,
    explanation: 'Monthly churn = 100 ÷ 2,000 = 5%. At 5% monthly churn, the business loses ~46% of its base annually. Most sustainable SaaS benchmarks target <2% monthly, or <1% for enterprise.',
  },
  {
    id: 'nps',
    concept: 'Customer Loyalty',
    question: 'Net Promoter Score (NPS) is calculated as:',
    options: [
      'Average satisfaction score on a 1–10 scale across all customers',
      '% of Promoters (9–10) minus % of Detractors (0–6)',
      'Total positive reviews divided by total reviews received',
      '% of customers who purchased again within 90 days',
    ],
    correctIndex: 1,
    explanation: 'NPS ranges from −100 to +100. Scores above 50 are excellent. It\'s a useful leading indicator of word-of-mouth growth — Promoters refer; Detractors warn others away. But it should always be paired with qualitative follow-up.',
  },
  {
    id: 'cpm-cpc',
    concept: 'Paid Media',
    question: 'A brand awareness campaign is typically best evaluated using:',
    options: [
      'CPC — because clicks prove the audience engaged',
      'CPA — because it directly ties spend to a revenue outcome',
      'CPM and reach — because awareness is about efficient impressions at scale',
      'ROAS — because it links every pound spent to pounds returned',
    ],
    correctIndex: 2,
    explanation: 'Awareness campaigns aim to build mental availability broadly and efficiently. CPC and CPA are performance metrics suited to lower-funnel, direct-response intent. Measuring awareness by CPA punishes the channel for doing a different job.',
  },
  {
    id: 'roas',
    concept: 'Paid Media',
    question: 'A campaign generates £80,000 in revenue from £20,000 in ad spend. What is the ROAS?',
    options: [
      '25%',
      '4×',
      '60,000 return',
      '400 basis points',
    ],
    correctIndex: 1,
    explanation: 'ROAS = Revenue ÷ Ad Spend = £80k ÷ £20k = 4×. Every £1 spent returned £4. Importantly: ROAS ignores margins and blended costs — a 4× ROAS on a 20% margin product may still be unprofitable.',
  },

  // ── Strategy & Growth ─────────────────────────────────────────────────────
  {
    id: 'seo',
    concept: 'SEO',
    question: 'The most effective long-term driver of organic search ranking improvement is:',
    options: [
      'Increasing keyword density across existing page content',
      'Earning high-quality backlinks from authoritative, relevant domains',
      'Submitting updated sitemaps to Google Search Console monthly',
      'Publishing a higher volume of pages to expand content coverage',
    ],
    correctIndex: 1,
    explanation: 'Backlinks signal trust and authority to search engines. On-page optimisation is a prerequisite — but link equity from respected sites is the primary differentiator between pages competing for the same keyword.',
  },
  {
    id: 'email',
    concept: 'Lifecycle Marketing',
    question: 'For a DTC ecommerce brand, the most commercially meaningful email metric beyond open rate is:',
    options: [
      'List size — total subscribers reached',
      'Unsubscribe rate — audience health signal',
      'Revenue per email (RPE) or email conversion rate',
      'Hard bounce rate',
    ],
    correctIndex: 2,
    explanation: 'Open rate measures attention. RPE measures business impact. A campaign with 15% open rate and high RPE outperforms one with 35% open rate and zero purchases. Revenue per email is the clearest indicator of whether your list is an asset.',
  },
  {
    id: 'paid-vs-organic',
    concept: 'Channel Strategy',
    question: 'The primary strategic risk of over-relying on paid acquisition is:',
    options: [
      'Brand perception suffers when ad spend is visibly high',
      'Customer data cannot be collected via paid channels',
      'Growth stops immediately when budget is cut — no compounding asset is built',
      'CPCs always inflate faster than organic channel growth',
    ],
    correctIndex: 2,
    explanation: 'Paid channels are efficient but linear and non-compounding — stop spending, stop growing. Organic channels (SEO, content, community, referral) compound: value built today generates returns for months or years. Sustainable growth models mix both.',
  },
  {
    id: 'growth-loops',
    concept: 'Product Growth',
    question: 'A growth loop differs from a marketing funnel because:',
    options: [
      'Loops only apply to consumer apps; funnels apply to B2B',
      'The output of a loop feeds back as input, creating compounding acquisition rather than linear flow',
      'A loop measures retention while a funnel measures acquisition',
      'Loops require a product team; funnels are owned by marketing',
    ],
    correctIndex: 1,
    explanation: 'Funnels are linear: new users enter, some convert, it ends. Loops are compounding: new users create content/referrals/data that bring in the next wave of users. Examples: Dropbox (share a file → recipient signs up), TikTok (watch → create → algorithmic distribution → more watch).',
  },
  {
    id: 'penetration-pricing',
    concept: 'Pricing Strategy',
    question: 'Penetration pricing means:',
    options: [
      'Setting a high initial price to capture value from early adopters, then reducing it over time',
      'Setting a low initial price to gain market share rapidly, with the intent to raise prices later',
      'Pricing below cost to force out weaker competitors',
      'Matching the category leader\'s price to avoid direct comparison',
    ],
    correctIndex: 1,
    explanation: 'Penetration pricing trades early margin for market share velocity. The inverse — price skimming — maximises revenue from early adopters willing to pay a premium. Neither is universally superior; choice depends on competitive dynamics, cost structure, and network effects.',
  },
];
