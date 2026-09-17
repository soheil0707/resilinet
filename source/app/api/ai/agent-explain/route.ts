import { NextRequest, NextResponse } from 'next/server';

// Optional server-side Gemini API route for agent explanations.
// Falls back to deterministic rationale if GEMINI_API_KEY is not set.

const DETERMINISTIC_RATIONALES: Record<string, string> = {
  PROCUREMENT:
    'Procurement analysis confirms Bharat Precision (Pune) is the optimal secondary source. ISO 9001:2015 certified, on the Approved Vendor List, and capable of dispatching 220 units within 7 days at ₹1,200/unit surcharge — within the ₹5L delegated authority for supply chain emergencies.',
  INVENTORY:
    'PL-02 Chennai holds surplus M-101 inventory (5.6 days coverage). A 120-unit inter-plant STO can be issued immediately via SAP EWM, arriving Hyderabad in 36 hours via overnight road express at ₹0.8L — the lowest-cost component of the combined strategy.',
  PRODUCTION:
    'Production scheduling analysis shows 12 of 17 affected orders are high-margin EV-X Prime lines. By reserving all incoming M-101 inventory for EV-X priority, and rescheduling 5 Sierra SUV orders by 5 days (within SLA tolerance), line throughput can recover to 120 units/day within 48 hours.',
  LOGISTICS:
    'Logistics analysis confirms air charter (ATR-72) from Jamshedpur delivers 100 buffer units to Hyderabad in under 48 hours. Combined with overnight road express from Chennai (36 hrs), combined mode satisfies the 2.4-day inventory buffer window. Road-only transit from Bharat Precision is 7 days — too slow.',
  FINANCE:
    'Financial impact model: Combined Recovery costs ₹2.1L (air ₹1.3L + road ₹0.8L) against ₹27.4L exposure. Net revenue protected: ₹24.2L. ROI: 11.5x — significantly outperforming all single-mode alternatives. All spend is within the SCM emergency authority of ₹5L.',
  CUSTOMER:
    '20 customer orders reviewed. 8 Tier-1 OEM fleet accounts (₹12L penalty exposure) have contract milestone deadlines within 3 days. The Combined Recovery delivers materials in 1–2 days, satisfying all OEM SLA commitments and preserving long-term account relationships worth ₹4.2Cr annualized revenue.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, context } = body as { agentId: string; context?: string };

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    // Try Gemini if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const genai = new GoogleGenAI({ apiKey });
        const prompt = `You are a Supply Chain AI Agent (${agentId}) analyzing the S-104 Global Metals Ltd. supplier shutdown at Astra Motors Manufacturing. ${context || ''} Provide a concise 2-3 sentence executive rationale for why the Combined Recovery strategy (air cargo + inter-plant transfer) is the optimal recommendation. Be specific with the numbers from the scenario.`;
        const result = await genai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
        });
        const text = result.text;
        if (text) {
          return NextResponse.json({ rationale: text, source: 'gemini' });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic rationale:', geminiError);
      }
    }

    // Deterministic fallback
    const rationale = DETERMINISTIC_RATIONALES[agentId] || DETERMINISTIC_RATIONALES['FINANCE'];
    return NextResponse.json({ rationale, source: 'deterministic' });
  } catch (err) {
    console.error('Agent explain route error:', err);
    return NextResponse.json(
      { error: 'Internal server error', rationale: DETERMINISTIC_RATIONALES['FINANCE'], source: 'deterministic' },
      { status: 500 }
    );
  }
}
