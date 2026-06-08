import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { AssessmentResult } from "./engine";

// ── Brand tokens ───────────────────────────────────────────────
const NAVY      = "#0d1b2a";
const ORANGE    = "#e8601b";
const WHITE     = "#ffffff";
const GRAY_BAR  = "#e2e8f0";
const TEXT_DARK = "#1a2e3b";
const TEXT_MID  = "#4a6375";
const TEXT_MUTE = "#8fa3b0";

const DOMAIN_CLR: Record<string, string> = {
  Digital:   "#2563eb",
  Legal:     "#16a34a",
  Financial: "#ea580c",
  Physical:  "#7c3aed",
  ALL:       "#e8601b",
};

const BAND_CLR: Record<string, string> = {
  "AT RISK":            "#c0392b",
  "SOMEWHAT PREPARED":  "#d97706",
  "PREPARED":           "#15803d",
};

const JESSE_NOTES: Record<number, string> = {
  1: "Day 1 is done. Tomorrow moves to your second weakest domain.",
  2: "Two days in, streak is live. Tomorrow is the halfway lean-in.",
  3: "Halfway there. Tomorrow you touch your fourth and final domain.",
  4: "Every domain has now been touched. Tomorrow we return to your weakest for a second, deeper action.",
  5: "Back to the hardest domain. One more day before consolidation.",
  6: "Six days down. Tomorrow is consolidation and your next step.",
};

function day7Closing(result: AssessmentResult): string {
  const n = result.name;
  if (result.band === "AT RISK")
    return `${n}, seven days ago you were at risk. You just completed 7 actions in 7 days. That is what readiness starts to look like. Your next step: book a 1:1 with Niki to lock in what you have built.`;
  if (result.band === "SOMEWHAT PREPARED")
    return `${n}, seven days ago you had real gaps. You just closed the most important ones. Next step: a 1:1 with Niki to finish the plan, or the 7-Week Sprint to go deeper.`;
  return `${n}, you started prepared and spent seven days sharpening the edges. The 7-Week Sprint is built for people at your level who want to move from prepared to bulletproof.`;
}

// ── Shared chrome ──────────────────────────────────────────────

function pageHeader(title: string, subtitle: string): string {
  return `
  <div style="background:${NAVY};padding:16px 32px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:30px;height:30px;background:${ORANGE};border-radius:4px;display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 15,14 1,14" fill="${WHITE}"/></svg>
      </div>
      <div>
        <div style="color:${WHITE};font-size:12px;font-weight:800;letter-spacing:1px;">ENDevo&#8482;</div>
        <div style="color:rgba(255,255,255,0.45);font-size:9px;letter-spacing:0.5px;">PLAN. PROTECT. PEACE.</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="color:${WHITE};font-size:15px;font-weight:800;">${title}</div>
      <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:2px;">${subtitle}</div>
    </div>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,${ORANGE},#f5a623);"></div>`;
}

function pageFooter(): string {
  return `
  <div style="background:${NAVY};padding:11px 32px;display:flex;justify-content:space-between;align-items:center;">
    <span style="color:${ORANGE};font-size:11px;font-weight:600;">https://endevo.life</span>
    <span style="color:rgba(255,255,255,0.45);font-size:10px;">ENDevo - Plan. Protect. Peace.</span>
  </div>`;
}

// ── SVG donut chart ────────────────────────────────────────────

function donutChart(result: AssessmentResult): string {
  const cx = 70, cy = 70, r = 52, sw = 20;
  const circ = 2 * Math.PI * r;
  const maxTotal = result.domainResults.length * 6;
  const total = result.domainResults.reduce((s, d) => s + d.score, 0);
  const avgPct = Math.round((total / maxTotal) * 100);

  let offset = 0;
  const slices = result.domainResults.map((dr) => {
    const frac = maxTotal > 0 ? dr.score / maxTotal : 0.25;
    const dash = frac * circ;
    const slice = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${DOMAIN_CLR[dr.domain] ?? ORANGE}" stroke-width="${sw}"
      stroke-dasharray="${dash} ${circ - dash}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
    return slice;
  }).join("");

  const legend = result.domainResults.map((dr) => `
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
      <div style="width:9px;height:9px;border-radius:50%;background:${DOMAIN_CLR[dr.domain] ?? ORANGE};"></div>
      <span style="font-size:10px;color:${TEXT_MID};">${dr.domain}</span>
    </div>`).join("");

  return `
  <div style="display:flex;align-items:center;gap:12px;">
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY_BAR}" stroke-width="${sw}"/>
      ${slices}
      <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="20" font-weight="900" fill="${TEXT_DARK}">${avgPct}%</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" fill="${TEXT_MUTE}" letter-spacing="0.5">avg</text>
    </svg>
    <div>${legend}</div>
  </div>`;
}

// ── Page 1: Score report ───────────────────────────────────────

function scorePage(result: AssessmentResult, dateStr: string): string {
  const bandColor = BAND_CLR[result.band] ?? ORANGE;

  const domainBars = result.domainResults.map((dr) => {
    const c = DOMAIN_CLR[dr.domain] ?? ORANGE;
    return `
    <div style="margin-bottom:13px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="font-weight:700;font-size:13px;color:${TEXT_DARK};">${dr.domain}</span>
        <span style="font-weight:700;font-size:13px;color:${c};">${dr.percent}%</span>
      </div>
      <div style="background:${GRAY_BAR};border-radius:4px;height:10px;overflow:hidden;">
        <div style="background:${c};height:10px;width:${dr.percent}%;border-radius:4px;"></div>
      </div>
    </div>`;
  }).join("");

  const journeyDots = result.plan.map((d, i) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div style="width:44px;height:44px;border-radius:50%;
        background:${i === 0 ? ORANGE : "transparent"};
        border:2px solid ${i === 0 ? ORANGE : GRAY_BAR};
        color:${i === 0 ? WHITE : TEXT_MUTE};
        font-weight:800;font-size:15px;
        display:flex;align-items:center;justify-content:center;">${d.day}</div>
      <div style="font-size:10px;font-weight:${i === 0 ? "700" : "400"};color:${i === 0 ? ORANGE : TEXT_MUTE};">
        ${i === 0 ? "Today" : `Day ${d.day}`}
      </div>
    </div>`).join("");

  const bandDesc =
    result.band === "AT RISK"
      ? "You're not alone -- most people are here. This week we start closing the biggest gaps."
      : result.band === "SOMEWHAT PREPARED"
      ? "You have started but gaps remain. This week we close the most important ones."
      : "You are prepared. This week we sharpen the edges.";

  return `
  <div style="display:flex;flex-direction:column;min-height:100vh;background:${WHITE};">
    ${pageHeader("Legacy Readiness Assessment", `${result.name} · ${dateStr}`)}

    <div style="padding:32px 40px;flex:1;display:flex;flex-direction:column;">

      <!-- Score hero row -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">
        <div>
          <div style="font-size:90px;font-weight:900;color:${TEXT_DARK};line-height:0.95;letter-spacing:-3px;">${result.percentReady}%</div>
          <div style="font-size:10px;font-weight:700;color:${TEXT_MUTE};letter-spacing:2px;text-transform:uppercase;margin-top:8px;margin-bottom:14px;">AVERAGE READINESS</div>
          <div style="display:inline-block;background:${bandColor};color:${WHITE};font-weight:800;font-size:13px;padding:7px 20px;border-radius:4px;margin-bottom:14px;">${result.band}</div>
          <div style="font-size:12.5px;color:${TEXT_MID};line-height:1.7;max-width:290px;">${bandDesc}</div>
        </div>
        <div style="padding-top:6px;">${donutChart(result)}</div>
      </div>

      <!-- Domain bars -->
      <div style="border-top:1px solid ${GRAY_BAR};padding-top:20px;margin-bottom:24px;">
        <div style="font-size:10px;font-weight:700;color:${TEXT_MUTE};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">YOUR SCORE BREAKDOWN</div>
        ${domainBars}
      </div>

      <!-- Journey dots -->
      <div style="border-top:1px solid ${GRAY_BAR};padding-top:20px;">
        <div style="font-size:10px;font-weight:700;color:${TEXT_MUTE};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">YOUR 7-DAY JOURNEY</div>
        <div style="display:flex;gap:8px;align-items:flex-start;">${journeyDots}</div>
      </div>

      <!-- Disclaimer -->
      <div style="margin-top:auto;padding-top:20px;border-top:1px solid ${GRAY_BAR};margin-top:28px;">
        <span style="font-size:10px;color:${TEXT_MUTE};">This report is for educational purposes only. Not legal or financial advice. Jesse by ENDevo - https://endevo.life</span>
      </div>
    </div>

    ${pageFooter()}
  </div>`;
}

// ── Pages 2+: Day plan ─────────────────────────────────────────

function dayBlock(
  day: number, domain: string, title: string,
  socialProof: string, howTo: string, jesseNote: string
): string {
  const labelLines = domain === "ALL"
    ? ["Consolidate &", "Commit"]
    : [`${domain}`, "Readiness"];

  return `
  <div style="display:flex;gap:0;margin-bottom:4px;page-break-inside:avoid;">
    <!-- Left: day + domain -->
    <div style="min-width:128px;max-width:128px;padding-right:16px;">
      <div style="color:${ORANGE};font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">DAY ${String(day).padStart(2, "0")}</div>
      <div style="font-size:19px;font-weight:900;color:${TEXT_DARK};line-height:1.2;">
        ${labelLines.map(l => `<div>${l}</div>`).join("")}
      </div>
    </div>
    <!-- Right: checkbox + content -->
    <div style="flex:1;display:flex;gap:14px;align-items:flex-start;">
      <div style="width:20px;height:20px;border:2px solid #b0c4cc;border-radius:3px;flex-shrink:0;margin-top:3px;"></div>
      <div style="flex:1;">
        <div style="font-size:13.5px;font-weight:700;color:${TEXT_DARK};margin-bottom:8px;line-height:1.45;">${title}</div>
        <div style="font-size:11.5px;color:${TEXT_MID};line-height:1.65;margin-bottom:8px;">${socialProof}</div>
        <div style="font-size:11.5px;color:${TEXT_DARK};line-height:1.65;"><strong>How:</strong> ${howTo}</div>
      </div>
    </div>
  </div>
  ${jesseNote ? `
  <div style="background:#fff7ed;border-left:3px solid ${ORANGE};padding:9px 14px;margin:10px 0 0 128px;border-radius:0 5px 5px 0;">
    <span style="color:${ORANGE};font-size:11px;font-style:italic;line-height:1.6;">${jesseNote}</span>
  </div>` : ""}
  <hr style="border:none;border-top:1px solid ${GRAY_BAR};margin:16px 0;">`;
}

function planPages(result: AssessmentResult): string {
  const subtitle = `Prepared for ${result.name} · ${result.band}`;
  const blocks = result.plan.map((d) => {
    const note = d.day === 7 ? day7Closing(result) : (JESSE_NOTES[d.day] ?? "");
    return dayBlock(d.day, d.domain, d.action.title, d.action.socialProof, d.action.howTo, note);
  }).join("");

  const noteLines = Array(9).fill(
    `<div style="border-bottom:1px solid ${GRAY_BAR};height:30px;"></div>`
  ).join("");

  return `
  <div style="display:flex;flex-direction:column;min-height:100vh;background:${WHITE};">
    ${pageHeader("Your 7-Day Legacy Plan", subtitle)}
    <div style="padding:28px 40px;flex:1;display:flex;flex-direction:column;">
      ${blocks}
      <!-- MY NOTES -->
      <div style="margin-top:16px;page-break-inside:avoid;">
        <div style="font-size:10px;font-weight:700;color:${TEXT_MUTE};letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">MY NOTES</div>
        <div style="border:1px solid ${GRAY_BAR};border-radius:6px;padding:14px 16px;">${noteLines}</div>
        <div style="font-size:10px;color:${TEXT_MUTE};margin-top:8px;">Use this space to capture your thoughts, priorities, or reminders as you work through your plan.</div>
      </div>
      <div style="margin-top:20px;padding-top:14px;border-top:1px solid ${GRAY_BAR};">
        <span style="font-size:10px;color:${TEXT_MUTE};">This report is for educational purposes only. Not legal or financial advice. Jesse by ENDevo - https://endevo.life</span>
      </div>
    </div>
    ${pageFooter()}
  </div>`;
}

// ── Public API ─────────────────────────────────────────────────

export function buildPdfHtml(result: AssessmentResult, dateStr: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @page { margin: 0; size: A4 portrait; }
  * { box-sizing: border-box; margin: 0; padding: 0;
      font-family: -apple-system, Helvetica Neue, Arial, sans-serif;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { background: #fff; }
  a { color: inherit; text-decoration: none; pointer-events: none; }
</style>
</head>
<body>
  ${scorePage(result, dateStr)}
  <div style="page-break-before:always;"></div>
  ${planPages(result)}
</body>
</html>`;
}

export function buildPdfFilename(name: string): string {
  const d    = new Date();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  const safe = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${safe}-7daylegacyplanner-${mm}-${dd}-${yyyy}`;
}

export async function downloadPDF(result: AssessmentResult): Promise<void> {
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const html = buildPdfHtml(result, dateStr);

  // Web: open branded HTML in a new tab — user presses Ctrl+P → Save as PDF
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      // Auto-trigger print dialog after render
      win.onload = () => win.print();
    }
    return;
  }

  // Native (iOS/Android): generate file and share
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${buildPdfFilename(result.name)}.pdf`,
      UTI: "com.adobe.pdf",
    });
  }
}
