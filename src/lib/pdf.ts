import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { AssessmentResult } from "./engine";

// Brand colours
const NAVY = "#0f1f3d";
const ORANGE = "#e85d1b";
const AMBER = "#f5a623";
const WHITE = "#ffffff";
const MUTED = "#8fa3b8";
const LIGHT_GRAY = "#e2e8f0";
const TEXT_DARK = "#1a2e45";
const TEXT_MID = "#475569";
const TEXT_LIGHT = "#64748b";

const DOMAIN_COLORS: Record<string, string> = {
  Digital: "#2563eb",
  Legal: "#16a34a",
  Financial: "#ea580c",
  Physical: "#7c3aed",
  ALL: "#e85d1b",
};

const BAND_COLORS: Record<string, string> = {
  "AT RISK": "#c0392b",
  "SOMEWHAT PREPARED": "#D94A28",
  "PREPARED": "#b8860b",
};

const JESSE_NOTES: Record<number, string> = {
  1: "Day 1 is done. Tomorrow moves to your second weakest domain.",
  2: "Two days in, streak is live. Tomorrow is the halfway lean-in.",
  3: "Halfway there. Tomorrow you touch your fourth and final domain.",
  4: "Every domain has now been touched. Tomorrow we return to your weakest for a second, deeper action.",
  5: "Back to the hardest domain. One more day before consolidation.",
  6: "Six days down. Tomorrow is consolidation and your next step.",
};

function getDay7Closing(result: AssessmentResult): string {
  const { name, band } = result;
  if (band === "AT RISK")
    return `${name}, seven days ago you were at risk. You just completed 7 actions in 7 days. That is what readiness starts to look like. Your next step: book a 1:1 with Niki to lock in what you have built.`;
  if (band === "SOMEWHAT PREPARED")
    return `${name}, seven days ago you had real gaps. You just closed the most important ones. Next step: a 1:1 with Niki to finish the plan, or the 7-Week Sprint to go deeper.`;
  return `${name}, you started prepared and spent seven days sharpening the edges. The 7-Week Sprint is built for people at your level who want to move from prepared to bulletproof.`;
}

// ── Shared page chrome ──────────────────────────────────────────

function pageHeader(title: string, subtitle: string): string {
  return `
    <div style="background:${NAVY};padding:18px 32px;display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:${ORANGE};font-size:20px;font-weight:900;">&#9650;</span>
        <div>
          <div style="color:${WHITE};font-size:7px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:0.7;">ENDevo&#8482;</div>
          <div style="color:${WHITE};font-size:8px;font-weight:600;opacity:0.6;">PLAN. PROTECT. PEACE.</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="color:${WHITE};font-weight:800;font-size:16px;">${title}</div>
        <div style="color:${MUTED};font-size:11px;margin-top:2px;">${subtitle}</div>
      </div>
    </div>
    <div style="height:3px;background:linear-gradient(90deg,${ORANGE} 0%,${AMBER} 100%);"></div>`;
}

function pageFooter(): string {
  return `
    <div style="background:${NAVY};padding:12px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:auto;">
      <span style="color:${ORANGE};font-size:11px;font-weight:600;">https://endevo.life</span>
      <span style="color:${MUTED};font-size:10px;">ENDevo - Plan. Protect. Peace.</span>
    </div>`;
}

// ── Page 1: Score Report ────────────────────────────────────────

function buildScorePage(result: AssessmentResult, dateStr: string): string {
  const bandColor = BAND_COLORS[result.band] ?? ORANGE;

  const domainBars = result.domainResults.map((dr) => {
    const color = DOMAIN_COLORS[dr.domain] ?? ORANGE;
    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-weight:700;font-size:13px;color:${TEXT_DARK};">${dr.domain}</span>
          <span style="font-weight:700;font-size:13px;color:${color};">${dr.percent}%</span>
        </div>
        <div style="background:${LIGHT_GRAY};border-radius:4px;height:9px;width:100%;overflow:hidden;">
          <div style="background:${color};border-radius:4px;height:9px;width:${dr.percent}%;"></div>
        </div>
      </div>`;
  }).join("");

  const journeyDots = result.plan.map((d, i) => `
    <div style="text-align:center;">
      <div style="width:42px;height:42px;border-radius:50%;background:${i === 0 ? ORANGE : LIGHT_GRAY};color:${i === 0 ? WHITE : TEXT_LIGHT};font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;margin:0 auto;">${d.day}</div>
      <div style="font-size:10px;color:${TEXT_LIGHT};margin-top:4px;font-weight:${i === 0 ? "700" : "400"};color:${i === 0 ? ORANGE : TEXT_LIGHT};">${i === 0 ? "Today" : `Day ${d.day}`}</div>
    </div>`).join("");

  return `
    <div style="display:flex;flex-direction:column;min-height:297mm;background:${WHITE};">
      ${pageHeader("Legacy Readiness Assessment", `${result.name} · ${dateStr}`)}

      <div style="padding:36px 40px;flex:1;">

        <div style="display:flex;gap:40px;align-items:flex-start;margin-bottom:32px;">
          <div style="flex:1;">
            <div style="font-size:80px;font-weight:900;color:${TEXT_DARK};line-height:1;letter-spacing:-2px;">${result.percentReady}%</div>
            <div style="color:${TEXT_LIGHT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;margin-top:4px;">AVERAGE READINESS</div>
            <div style="display:inline-block;background:${bandColor};color:${WHITE};font-weight:800;font-size:13px;letter-spacing:0.5px;padding:7px 18px;border-radius:4px;margin-bottom:14px;">${result.band}</div>
            <div style="font-size:13px;color:${TEXT_MID};line-height:1.7;max-width:340px;">
              ${result.band === "AT RISK"
                ? "You're not alone -- most people are here. This week we start closing the biggest gaps."
                : result.band === "SOMEWHAT PREPARED"
                ? "You've started but real gaps remain. This week we close the most important ones."
                : "You're prepared. This week we sharpen the edges that separate prepared from bulletproof."}
            </div>
          </div>
        </div>

        <div style="border-top:1px solid ${LIGHT_GRAY};padding-top:24px;margin-bottom:28px;">
          <div style="font-size:10px;font-weight:700;color:${TEXT_LIGHT};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:18px;">YOUR SCORE BREAKDOWN</div>
          <div style="display:flex;gap:24px;align-items:flex-start;">
            <div style="flex:1;">${domainBars}</div>
          </div>
        </div>

        <div style="border-top:1px solid ${LIGHT_GRAY};padding-top:24px;">
          <div style="font-size:10px;font-weight:700;color:${TEXT_LIGHT};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px;">YOUR 7-DAY JOURNEY</div>
          <div style="display:flex;gap:10px;align-items:flex-start;">${journeyDots}</div>
        </div>

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid ${LIGHT_GRAY};">
          <span style="font-size:10px;color:${TEXT_LIGHT};">This report is for educational purposes only. Not legal or financial advice. Jesse by ENDevo - https://endevo.life</span>
        </div>
      </div>

      ${pageFooter()}
    </div>`;
}

// ── Pages 2+: Day plan pages ────────────────────────────────────

function buildDayBlock(day: number, domain: string, title: string, socialProof: string, howTo: string, jesseNote: string): string {
  const domainLabel = domain === "ALL" ? "Consolidate & Commit" : `${domain} Readiness`;
  const color = DOMAIN_COLORS[domain] ?? ORANGE;

  return `
    <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:6px;page-break-inside:avoid;">
      <div style="min-width:110px;">
        <div style="color:${ORANGE};font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">DAY ${String(day).padStart(2, "0")}</div>
        <div style="font-weight:900;font-size:17px;color:${TEXT_DARK};line-height:1.2;">${domainLabel.replace(" ", "<br/>")}</div>
      </div>
      <div style="flex:1;border-left:none;padding-left:0;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <div style="width:22px;height:22px;border:2px solid #ccc;border-radius:3px;flex-shrink:0;margin-top:2px;"></div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;color:${TEXT_DARK};margin-bottom:8px;line-height:1.5;">${title}</div>
            <div style="font-size:11.5px;color:${TEXT_MID};line-height:1.65;margin-bottom:8px;">${socialProof}</div>
            <div style="font-size:11.5px;color:${TEXT_DARK};line-height:1.65;"><span style="font-weight:600;">How:</span> ${howTo}</div>
          </div>
        </div>
      </div>
    </div>
    ${jesseNote ? `
    <div style="background:#fff7ed;border-left:3px solid ${ORANGE};padding:9px 14px;margin:12px 0 0 130px;border-radius:0 5px 5px 0;page-break-inside:avoid;">
      <span style="color:${ORANGE};font-size:11px;font-style:italic;line-height:1.5;">${jesseNote}</span>
    </div>` : ""}
    <hr style="border:none;border-top:1px solid ${LIGHT_GRAY};margin:18px 0;">`;
}

function buildPlanPages(result: AssessmentResult): string {
  const subtitle = `Prepared for ${result.name} · ${result.band}`;

  const dayBlocks = result.plan.map((d) => {
    const note = d.day === 7 ? getDay7Closing(result) : (JESSE_NOTES[d.day] ?? "");
    return buildDayBlock(d.day, d.domain, d.action.title, d.action.socialProof, d.action.howTo, note);
  }).join("");

  const notesLines = Array(8).fill(`<div style="border-bottom:1px solid ${LIGHT_GRAY};height:28px;margin-bottom:4px;"></div>`).join("");

  return `
    <div style="display:flex;flex-direction:column;min-height:297mm;background:${WHITE};">
      ${pageHeader("Your 7-Day Legacy Plan", subtitle)}

      <div style="padding:28px 40px;flex:1;">
        ${dayBlocks}

        <div style="margin-top:20px;page-break-inside:avoid;">
          <div style="font-size:10px;font-weight:700;color:${TEXT_LIGHT};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;">MY NOTES</div>
          <div style="border:1px solid ${LIGHT_GRAY};border-radius:6px;padding:16px;">
            ${notesLines}
          </div>
          <div style="font-size:10px;color:${TEXT_LIGHT};margin-top:8px;">Use this space to capture your thoughts, priorities, or reminders as you work through your plan.</div>
        </div>

        <div style="margin-top:20px;padding-top:14px;border-top:1px solid ${LIGHT_GRAY};">
          <span style="font-size:10px;color:${TEXT_LIGHT};">This report is for educational purposes only. Not legal or financial advice. Jesse by ENDevo - https://endevo.life</span>
        </div>
      </div>

      ${pageFooter()}
    </div>`;
}

// ── Public API ──────────────────────────────────────────────────

export function buildPdfHtml(result: AssessmentResult, dateStr: string): string {
  const pageStyle = `
    @page { margin: 0; size: A4 portrait; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, Helvetica Neue, Arial, sans-serif; -webkit-print-color-adjust: exact; }
    body { background: ${WHITE}; }
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>${pageStyle}</style>
</head>
<body>
  ${buildScorePage(result, dateStr)}
  <div style="page-break-before:always;"></div>
  ${buildPlanPages(result)}
</body>
</html>`;
}

export function buildPdfFilename(name: string): string {
  const date = new Date();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  const safeName = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${safeName}-7daylegacyplanner-${mm}-${dd}-${yyyy}`;
}

export async function downloadPDF(result: AssessmentResult): Promise<void> {
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const html = buildPdfHtml(result, dateStr);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const filename = buildPdfFilename(result.name);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${filename}.pdf`,
      UTI: "com.adobe.pdf",
    });
  }
}
