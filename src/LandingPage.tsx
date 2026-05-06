import React from 'react';

interface LandingPageProps {
  onStartFundamentals: () => void;
  onStartFullTest: () => void;
}

export default function LandingPage({ onStartFundamentals, onStartFullTest }: LandingPageProps) {
  return (
    <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
      {/* Nav */}
      <header className="h-11 flex items-center px-5 border-b border-[#e8e8ed]">
        <span className="text-[12px] font-semibold text-[#1d1d1f] tracking-[-0.04px]">
          Marketing Skills
        </span>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[720px] mx-auto px-5 pt-16 pb-20 flex flex-col items-center text-center gap-0">

          {/* Eyebrow */}
          <p className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.1px]">
            Marketing Skills Assessment
          </p>

          {/* Display headline */}
          <h1 className="text-[56px] font-bold leading-[1.07] tracking-[-0.9px] text-[#1d1d1f] mt-4">
            Know where<br />you stand.
          </h1>

          {/* Subtitle */}
          <p className="text-[20px] font-light text-[#707070] leading-[1.4] tracking-[-0.2px] max-w-[500px] mt-5">
            Two ways to test your marketing knowledge — a quick fundamentals check, or a full system profile.
          </p>

          {/* Two path cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-12 text-left">

            {/* ── Quick fundamentals ── */}
            <div className="bg-white rounded-[28px] p-8 flex flex-col gap-5">
              <div>
                <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-3">
                  Quick Check
                </p>
                <h2 className="text-[28px] font-bold leading-[1.1] tracking-[-0.36px] text-[#1d1d1f]">
                  Marketing Fundamentals
                </h2>
                <p className="text-[15px] text-[#707070] leading-[1.47] tracking-[-0.1px] mt-3">
                  20 questions on core marketing concepts — brand positioning, market penetration, omnichannel, ESOV, digital performance, and growth fundamentals.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#e8e8ed]">
                {[
                  'Brand & positioning strategy',
                  'Digital performance concepts',
                  'Growth economics (CAC, LTV, churn)',
                  'Measurement and attribution',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] shrink-0" />
                    <span className="text-[13px] text-[#474747] leading-[1.43]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-[12px] text-[#707070]">20 questions · ~5 min</span>
                <button
                  onClick={onStartFundamentals}
                  className="px-5 py-2.5 bg-[#0071e3] text-white rounded-full text-[15px] font-normal hover:bg-[#0077ed] transition-colors cursor-pointer"
                >
                  Start
                </button>
              </div>
            </div>

            {/* ── Full assessment ── */}
            <div className="bg-[#1d1d1f] rounded-[28px] p-8 flex flex-col gap-5">
              <div>
                <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-3">
                  Deep Profile
                </p>
                <h2 className="text-[28px] font-bold leading-[1.1] tracking-[-0.36px] text-white">
                  Full System Assessment
                </h2>
                <p className="text-[15px] text-[#a1a1a6] leading-[1.47] tracking-[-0.1px] mt-3">
                  77 elements across 13 domains. Tests scope, depth, diagnostic reasoning, and executive judgement — plus 5 real-world scenario blocks.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {[
                  '4-layer scoring model',
                  'Anti-pattern detection',
                  'Candidate profile (T-Shaped, Full-Stack…)',
                  'Domain breakdown + learning path',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#707070] shrink-0" />
                    <span className="text-[13px] text-[#a1a1a6] leading-[1.43]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-[12px] text-[#707070]">Up to 231 questions · 30–45 min</span>
                <button
                  onClick={onStartFullTest}
                  className="px-5 py-2.5 bg-white text-[#1d1d1f] rounded-full text-[15px] font-normal hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                >
                  Start
                </button>
              </div>
            </div>

          </div>

          {/* Footer note */}
          <p className="text-[12px] text-[#707070] mt-10 max-w-[440px] leading-[1.5]">
            No account required. Results are shown immediately and stay in your browser session.
          </p>

        </div>
      </div>
    </div>
  );
}
