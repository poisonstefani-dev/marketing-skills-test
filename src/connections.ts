export interface ConnectionDatum {
  sourceId: string;
  targetId: string;
  label: string;
  strength?: number;
}

export const CONNECTIONS: ConnectionDatum[] = [
  { sourceId: 'chatgpt', targetId: 'seo_brief', label: 'Turns search insight into draftable content briefs', strength: 0.92 },
  { sourceId: 'chatgpt', targetId: 'storybrand', label: 'Transforms brand narrative into reusable prompt structure', strength: 0.86 },
  { sourceId: 'chatgpt', targetId: 'customer_int', label: 'Summarises interviews into clearer messaging inputs', strength: 0.84 },
  { sourceId: 'ga4', targetId: 'google_ads_p', label: 'Feeds performance signals back into paid search optimisation', strength: 0.9 },
  { sourceId: 'northbeam', targetId: 'meta_ads', label: 'Measures paid social impact against blended attribution', strength: 0.8 },
  { sourceId: 'segment', targetId: 'hubspot_crm', label: 'Joins behavioral events with CRM records for usable activation', strength: 0.88 },
  { sourceId: 'zapier', targetId: 'typeform_nps', label: 'Pushes customer feedback into downstream workflows', strength: 0.72 },
  { sourceId: 'hotjar_ux', targetId: 'optimizely_cro', label: 'Uses observed friction to prioritise experiments', strength: 0.83 },
  { sourceId: 'klaviyo', targetId: 'recharge', label: 'Triggers lifecycle messaging from subscription events', strength: 0.89 },
  { sourceId: 'branch', targetId: 'push_reengage', label: 'Reconnects app campaigns to deep-linked return journeys', strength: 0.78 },
  { sourceId: 'onesignal', targetId: 'onesig_plg', label: 'Reuses messaging infrastructure across channel and in-product prompts', strength: 0.74 },
  { sourceId: 'intercom', targetId: 'intercom_ai', label: 'Adds automation to live conversational support', strength: 0.77 },
  { sourceId: 'g2_trust', targetId: 'g2_profile', label: 'Review proof reinforces marketplace conversion intent', strength: 0.8 },
  { sourceId: 'eventbrite', targetId: 'regional_ev', label: 'Event ops data feeds regional field execution', strength: 0.7 },
  { sourceId: 'qr_pack', targetId: 'qr_code', label: 'Packaging moments create measurable direct response paths', strength: 0.76 },
  { sourceId: 'bus_wraps', targetId: 'ig_reels', label: 'Offline reach becomes social proof when people record it', strength: 0.69 },
  { sourceId: 'reddit_platform', targetId: 'reddit_subs', label: 'Platform content and owned communities reinforce each other', strength: 0.75 },
  { sourceId: 'tiktok_platform', targetId: 'tiktok_creator', label: 'Organic discovery compounds creator distribution', strength: 0.79 },
  { sourceId: 'webflow', targetId: 'unbounce_gl', label: 'Shared landing page operations speed growth experiments', strength: 0.67 },
  { sourceId: 'mutiny', targetId: 'demandbase_dg', label: 'Account signals personalise ABM buying journeys', strength: 0.87 },
  { sourceId: 'salesforce', targetId: 'sixsense_dg', label: 'Sales pipeline data sharpens account prioritisation', strength: 0.82 },
  { sourceId: 'onetrust', targetId: 'conversion_api', label: 'Consent rules determine what can be sent server-side', strength: 0.85 },
  { sourceId: 'meta_pixel', targetId: 'conversion_api', label: 'Browser and server events improve retargeting resilience', strength: 0.88 },
  { sourceId: 'midjourney', targetId: 'adcreative', label: 'Concept generation accelerates paid creative testing', strength: 0.73 },
  { sourceId: 'liveramp', targetId: 'trade_desk', label: 'Identity resolution improves cross-channel media activation', strength: 0.81 },
  { sourceId: 'shopify_an', targetId: 'klaviyo_ai', label: 'Commerce revenue patterns sharpen AI segmentation', strength: 0.77 },
  { sourceId: 'yt_live', targetId: 'hopin_ev', label: 'Live audience moments extend into managed event programs', strength: 0.64 },
  { sourceId: 'substack_pub', targetId: 'li_newsletter', label: 'Creator publishing and broadcast channels reinforce repeat reach', strength: 0.66 },
];