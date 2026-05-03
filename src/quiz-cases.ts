// ─── CASE BLOCK DATA ─────────────────────────────────────────────────────────
// Five real-world scenarios added after the core quiz.
// Each question links to specific element IDs for granular scoring.
// Question types: diagnostic | systems | executive (no knowledge/applied here).

export type CaseQuestionType = 'diagnostic' | 'systems' | 'executive';

export interface CaseQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  questionType: CaseQuestionType;
  linkedElementIds: string[]; // elements that receive a point for this question
  linkedDomain: string;
  antiPatterns: [string | null, string | null, string | null, string | null];
}

export interface CaseMetric {
  label: string;
  value: string;
  direction?: 'up' | 'down' | 'neutral';
}

export interface CaseBlock {
  id: string;
  number: number;
  title: string;
  scenario: string;
  metrics: CaseMetric[];
  linkedDomains: string[];
  questions: [CaseQuestion, CaseQuestion, CaseQuestion];
}

export const CASE_BLOCKS: CaseBlock[] = [
  // ─── CASE 1: DTC SKINCARE ───────────────────────────────────────────────────
  {
    id: 'case-dtc-skincare',
    number: 1,
    title: 'DTC Skincare Brand',
    scenario:
      'Traffic is up 40% QoQ. Meta reports ROAS 4.1×. But blended CAC has risen 28% and repeat purchase rate has dropped from 32% to 24%. Most of the growth is coming through retargeting and branded search — not new-customer acquisition.',
    metrics: [
      { label: 'Traffic growth', value: '+40% QoQ', direction: 'up' },
      { label: 'Meta reported ROAS', value: '4.1×', direction: 'up' },
      { label: 'Blended CAC', value: '+28%', direction: 'down' },
      { label: 'Repeat purchase rate', value: '32% → 24%', direction: 'down' },
    ],
    linkedDomains: ['Paid Media', 'Commerce & Revenue Ops', 'Lifecycle & Customer Success'],
    questions: [
      {
        question:
          'Meta Advantage+ reports 4.1× ROAS, but blended CAC has risen 28% over the same period. What is the most likely explanation?',
        options: [
          'Meta is under-investing — increase budget to bring down per-unit CAC through volume.',
          'Meta is over-attributing conversions from warm demand (retargeting and branded search), not generating incremental new customers. Run a geo-holdout test before scaling spend.',
          'The blended CAC calculation includes non-marketing overhead costs that should be excluded from the measurement.',
          'iOS privacy changes have caused systematic under-reporting of conversions, making ROAS appear lower than reality.',
        ],
        correctIndex: 1,
        questionType: 'diagnostic',
        linkedElementIds: ['meta_adv', 'meta_ads', 'meta_pixel'],
        linkedDomain: 'Paid Media',
        antiPatterns: ['budget_bias', null, null, 'attribution_naivety'],
      },
      {
        question:
          'Repeat purchase rate fell from 32% to 24% while traffic grew 40%. Retargeting spend is at an all-time high. What does this combination tell you about the acquisition mix?',
        options: [
          'The repeat purchase drop is seasonal — it will self-correct in Q2 without intervention.',
          'The email lifecycle programme needs optimisation to drive second purchases more effectively.',
          'Growth is attracting lower-LTV customers with different loyalty patterns from the original base — scaling spend before diagnosing this will compound the problem, not fix it.',
          'The product has a quality issue causing customers not to return — run NPS surveys to identify it.',
        ],
        correctIndex: 2,
        questionType: 'systems',
        linkedElementIds: ['rfm', 'retention-cohorts', 'recharge'],
        linkedDomain: 'Commerce & Revenue Ops',
        antiPatterns: [null, null, null, 'tool_solution_bias'],
      },
      {
        question:
          'Given rising CAC and falling repeat purchase, what is the correct first action before making any budget decisions?',
        options: [
          'Scale Meta spend further — more first-time buyers will offset the repeat purchase decline through volume.',
          'Pause Meta Advantage+ and reallocate the entire budget to Google Search for more measurable returns.',
          'Run an incrementality test (geo-holdout or PSA) to separate real Meta contribution from attribution noise, and segment new vs returning customer LTV before investing further.',
          'Launch a retention email programme to recover the repeat purchase rate before diagnosing the acquisition side.',
        ],
        correctIndex: 2,
        questionType: 'executive',
        linkedElementIds: ['meta_adv', 'rfm', 'retention-cohorts'],
        linkedDomain: 'Paid Media',
        antiPatterns: ['acquisition_fixation', 'tool_solution_bias', null, null],
      },
    ],
  },

  // ─── CASE 2: B2B SAAS PIPELINE ──────────────────────────────────────────────
  {
    id: 'case-b2b-pipeline',
    number: 2,
    title: 'B2B SaaS Pipeline Problem',
    scenario:
      'MQL volume grew 70% this quarter. Pipeline barely moved. Sales says leads are weak. Demo-to-close conversion is 14% vs a 30% industry benchmark. Sales cycle is 92 days. Win rate against one specific competitor is near zero.',
    metrics: [
      { label: 'MQL growth', value: '+70% QoQ', direction: 'up' },
      { label: 'Demo conversion', value: '14% vs 30% benchmark', direction: 'down' },
      { label: 'Sales cycle', value: '92 days', direction: 'down' },
      { label: 'Win rate vs main competitor', value: '~0%', direction: 'down' },
    ],
    linkedDomains: ['Commerce & Revenue Ops', 'Strategy & Market Thinking', 'Data, Privacy & AI'],
    questions: [
      {
        question:
          'MQL volume grew 70% but pipeline is flat and demo-to-close conversion is 14% vs a 30% benchmark. What is the most likely root cause?',
        options: [
          'Sales reps need stronger product training to improve demo quality and close more effectively.',
          'The lead scoring model over-weights engagement signals (email opens, page visits) and under-weights fit criteria (ICP match, company size, tech stack) — passing engaged but unqualified leads.',
          'Marketing needs to increase MQL volume further — statistically, more volume will produce more pipeline.',
          'The sales cycle length is the primary constraint — shorter-cycle verticals should be targeted instead.',
        ],
        correctIndex: 1,
        questionType: 'diagnostic',
        linkedElementIds: ['lead-scoring', 'salesforce', 'icp'],
        linkedDomain: 'Commerce & Revenue Ops',
        antiPatterns: ['tool_solution_bias', null, 'volume_bias', null],
      },
      {
        question:
          'Win rate against one competitor is near zero. The current ICP is defined as "Series B SaaS, 50–200 employees, using Salesforce." What ICP refinement is most needed?',
        options: [
          'Broaden the ICP to Series A to increase the total addressable pool of accounts.',
          'Remove Salesforce as an ICP signal — it adds friction to qualification without predicting win rate.',
          'Layer competitive displacement data into the ICP — identify firmographic or technographic patterns in deals won vs lost against that competitor specifically.',
          'Focus the ICP exclusively on accounts the competitor already serves and try to displace them.',
        ],
        correctIndex: 2,
        questionType: 'systems',
        linkedElementIds: ['icp', 'abm', 'sales_playbook'],
        linkedDomain: 'Strategy & Market Thinking',
        antiPatterns: [null, null, null, null],
      },
      {
        question:
          'With limited RevOps bandwidth, what is the single highest-leverage change to improve pipeline quality in the next 60 days?',
        options: [
          'Rebuild the lead scoring model from scratch using a predictive ML-based approach with 18 months of CRM data.',
          'Redefine MQL criteria — weight firmographic fit 2× above engagement signals, raise the threshold, align sales and marketing on the new definition, and stop passing leads that fail fit criteria.',
          'Pause all inbound lead generation and redirect all budget to outbound ABM against the target account list.',
          'Hire an additional SDR to reduce follow-up time on current MQL volume and improve contact rates.',
        ],
        correctIndex: 1,
        questionType: 'executive',
        linkedElementIds: ['lead-scoring', 'salesforce', 'pipeline-acceleration'],
        linkedDomain: 'Commerce & Revenue Ops',
        antiPatterns: ['tool_solution_bias', null, 'tool_solution_bias', 'budget_bias'],
      },
    ],
  },

  // ─── CASE 3: MOBILE APP GROWTH ───────────────────────────────────────────────
  {
    id: 'case-mobile-app',
    number: 3,
    title: 'Mobile App Growth',
    scenario:
      'Paid UA installs are up and CPI is on target. But Day 7 retention is 18% and first-transaction conversion is well below plan. Deep links are working — users land in the right screen. They just never reach the core action.',
    metrics: [
      { label: 'CPI vs target', value: 'On target', direction: 'neutral' },
      { label: 'D7 retention', value: '18%', direction: 'down' },
      { label: 'First transaction rate', value: 'Below plan', direction: 'down' },
      { label: 'Deep link function', value: 'Working', direction: 'neutral' },
    ],
    linkedDomains: ['Mobile Growth', 'Product Growth & PLG', 'Analytics & Experimentation'],
    questions: [
      {
        question:
          'Installs are up and CPI is on target, but D7 retention is 18% and first transactions are below plan. What is the most accurate diagnostic?',
        options: [
          'Paid UA campaigns are targeting the wrong audience — the install cohorts are structurally low-intent.',
          'App Store listing optimisation is needed — low-quality installs indicate a mismatch between listing and product promise.',
          'Deep link configuration is partially broken — users are landing in the wrong in-app context despite appearing to function.',
          "Acquisition is delivering users who don't reach the core value action — the activation gap between install and first transaction is the primary friction point, and cohort data will show where users drop off.",
        ],
        correctIndex: 3,
        questionType: 'diagnostic',
        linkedElementIds: ['appsflyer_attr', 'branch', 'aarrr'],
        linkedDomain: 'Mobile Growth',
        antiPatterns: [null, null, null, null],
      },
      {
        question:
          'PostHog data shows users who complete profile creation within 24 hours have 3.4× better D7 retention, but only 22% reach this step. What is the correct product response?',
        options: [
          'Simplify or remove profile creation — if only 22% complete it, it is too high-friction for early onboarding.',
          'Profile creation is the activation moment — redesign the entire onboarding experience so it becomes the first and most prominent action, not an optional or buried step.',
          'Launch a push notification sequence at D1 reminding users to complete their profile.',
          'The correlation is coincidental — engaged users would have retained anyway regardless of profile creation.',
        ],
        correctIndex: 1,
        questionType: 'systems',
        linkedElementIds: ['posthog', 'appcues', 'retention-cohorts'],
        linkedDomain: 'Product Growth & PLG',
        antiPatterns: [null, null, null, null],
      },
      {
        question:
          'The team has capacity to run one experiment this sprint. Which intervention has the highest expected impact on D7 retention and first-transaction rate?',
        options: [
          'A/B test two new App Store screenshots to improve install quality at the top of the funnel.',
          'Reduce the first-transaction price by 30% to lower the purchase barrier for new users.',
          'Redesign post-install onboarding so the highest-retention activation step (profile creation) is the first and most prominent action — all other steps follow it.',
          'Build a D1–D3 push notification re-engagement sequence to bring inactive users back before they churn.',
        ],
        correctIndex: 2,
        questionType: 'executive',
        linkedElementIds: ['appcues', 'posthog', 'retention-cohorts'],
        linkedDomain: 'Product Growth & PLG',
        antiPatterns: [null, 'discount_bias', null, null],
      },
    ],
  },

  // ─── CASE 4: MARKETPLACE LIQUIDITY ──────────────────────────────────────────
  {
    id: 'case-marketplace',
    number: 4,
    title: 'Marketplace Liquidity',
    scenario:
      'Buyer demand is strong and growing. Search volume for the category is rising. But sellers churn heavily after 3 months and buyers are complaining about limited selection in niche categories. The platform has a classic supply-side problem.',
    metrics: [
      { label: 'Buyer demand', value: 'Strong + growing', direction: 'up' },
      { label: 'Seller 3-month retention', value: 'Poor', direction: 'down' },
      { label: 'Niche category selection', value: 'Gaps reported', direction: 'down' },
      { label: 'Category search volume', value: 'Rising', direction: 'up' },
    ],
    linkedDomains: ['Product Growth & PLG', 'Commerce & Revenue Ops', 'Lifecycle & Customer Success'],
    questions: [
      {
        question:
          'Buyer engagement is growing but seller 3-month retention is poor and buyers are reporting selection gaps. What is the primary constraint on marketplace health?',
        options: [
          'The buyer experience needs UX investment — better search and filtering will reduce complaints.',
          'Seller acquisition needs more budget — more listings will solve the selection gap.',
          'Supply-side liquidity is the binding constraint. Without committed sellers, buyer satisfaction will degrade even if current demand is strong. Buyer growth without supply retention creates an unsustainable loop.',
          'The marketplace should launch a premium buyer subscription to increase LTV and reduce dependency on seller volume.',
        ],
        correctIndex: 2,
        questionType: 'diagnostic',
        linkedElementIds: ['network_effects', 'aarrr', 'value-prop'],
        linkedDomain: 'Product Growth & PLG',
        antiPatterns: [null, 'acquisition_fixation', null, null],
      },
      {
        question:
          'Cohort analysis shows: sellers completing fewer than 3 transactions in month 1 have 78% three-month churn. Sellers completing 5+ transactions in month 1 have 12% churn. What does this activation data imply?',
        options: [
          'Commission rates are too high for new sellers and should be reduced for the first 3 months.',
          'The seller dashboard is poor — better reporting tools will help sellers understand their performance.',
          'Early transaction volume is the seller activation signal — the platform should route demand toward new sellers in month 1 specifically to hit the 5-transaction threshold and change their retention trajectory.',
          'Three-month seller churn at this level is typical for marketplace businesses and doesn\'t require intervention.',
        ],
        correctIndex: 2,
        questionType: 'systems',
        linkedElementIds: ['network_effects', 'aarrr', 'gainsight'],
        linkedDomain: 'Product Growth & PLG',
        antiPatterns: ['discount_bias', 'tool_solution_bias', null, null],
      },
      {
        question:
          'With limited supply-side team resources, what is the single most effective immediate intervention to improve seller retention?',
        options: [
          'Launch an acquisition campaign targeting more sellers to replace those who churn.',
          'Build a demand-routing mechanism that preferentially surfaces new seller listings to buyers in relevant categories, paired with an onboarding checklist tied to the 5-transaction activation goal.',
          'Reduce listing fees for all sellers for the next quarter to improve the unit economics for supply.',
          'Focus all resources on buyer acquisition — more buyers will naturally pull more seller retention through increased demand.',
        ],
        correctIndex: 1,
        questionType: 'executive',
        linkedElementIds: ['network_effects', 'appcues', 'winback_series'],
        linkedDomain: 'Product Growth & PLG',
        antiPatterns: ['acquisition_fixation', null, 'discount_bias', 'acquisition_fixation'],
      },
    ],
  },

  // ─── CASE 5: PREMIUM BRAND AWARENESS GAP ────────────────────────────────────
  {
    id: 'case-brand-gap',
    number: 5,
    title: 'Premium Brand Awareness Gap',
    scenario:
      'An OOH campaign drove 72% aided recall in post-campaign surveys. But consideration barely moved — under 3% lift. Website direct traffic increased during the campaign period. Demo requests and product trial did not.',
    metrics: [
      { label: 'Aided recall', value: '72%', direction: 'up' },
      { label: 'Consideration lift', value: '<3%', direction: 'down' },
      { label: 'Direct website traffic', value: 'Increased', direction: 'up' },
      { label: 'Demo / trial requests', value: 'Flat', direction: 'down' },
    ],
    linkedDomains: ['Physical & Experiential', 'Earned Media & Analyst Relations', 'Analytics & Experimentation'],
    questions: [
      {
        question:
          'The OOH campaign achieved 72% aided recall but consideration lift was under 3%. What is the most accurate explanation for the gap?',
        options: [
          'The OOH placements were in wrong locations — the campaign reached the wrong audience demographic.',
          'The campaign flight was too short to accumulate enough frequency for consideration to shift.',
          'The campaign built brand memory but failed to connect it to a specific purchase trigger, use case, or self-image moment — recall without a consideration bridge cannot move buyers further down the funnel.',
          'Aided recall surveys are methodologically unreliable for measuring brand campaign effectiveness.',
        ],
        correctIndex: 2,
        questionType: 'diagnostic',
        linkedElementIds: ['static_bill', 'brand_act'],
        linkedDomain: 'Physical & Experiential',
        antiPatterns: [null, 'volume_bias', null, null],
      },
      {
        question:
          'Direct traffic to the website increased during the campaign but demo and trial requests stayed flat. What does this reveal about the conversion funnel?',
        options: [
          'The website CRO is the main problem — the homepage isn\'t converting the traffic the campaign generated.',
          'The brand campaign worked but the website lacks the proof and conversion triggers to move curious visitors into consideration — brand awareness brought people to the door but the site can\'t close the gap.',
          'The direct traffic increase is from branded search inflation and crawler bots, not genuine brand interest.',
          'The demo form should be replaced with a free trial to reduce friction and improve conversion.',
        ],
        correctIndex: 1,
        questionType: 'systems',
        linkedElementIds: ['static_bill', 'social-proof', 'dark-social'],
        linkedDomain: 'Physical & Experiential',
        antiPatterns: [null, null, null, 'tool_solution_bias'],
      },
      {
        question:
          'For the next phase, what is the most strategic change to bridge the gap between recall and consideration?',
        options: [
          'Increase OOH spend by 40% to push aided recall above 85% — consideration will follow at higher recall levels.',
          'Add a retargeting layer targeting post-OOH site visitors with proof-based creative (case studies, quantified outcomes, customer stories) that addresses the specific consideration need.',
          'Move the entire budget from OOH into performance digital channels where every conversion is directly attributable.',
          'Redesign OOH creative to include a QR code linking directly to a landing page for immediate conversion.',
        ],
        correctIndex: 1,
        questionType: 'executive',
        linkedElementIds: ['brand_act', 'social-proof', 'ga4'],
        linkedDomain: 'Physical & Experiential',
        antiPatterns: ['volume_bias', null, 'tool_solution_bias', null],
      },
    ],
  },
];
