import { Platform, ToastAndroid, Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import type { AssessmentResult } from "./engine";
import { PDF_LOGO_DATA_URI, PDF_JESSE_DATA_URI } from "./pdf-assets";

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
  <div style="background:${NAVY};padding:14px 32px;display:flex;justify-content:space-between;align-items:center;">
    <!-- Left: ENDevo brand logo -->
    <img src="${PDF_LOGO_DATA_URI}" alt="ENDevo" style="height:34px;width:auto;display:block;"/>

    <!-- Right: report title -->
    <div style="text-align:right;">
      <div style="color:${WHITE};font-size:15px;font-weight:800;line-height:1.25;">${title}</div>
      <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:2px;">${subtitle}</div>
    </div>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,${ORANGE},#f5a623);"></div>`;
}

function pageFooter(): string {
  return `
  <div style="background:${NAVY};padding:13px 32px;display:flex;justify-content:center;align-items:center;">
    <a href="https://endevo.life" style="display:flex;align-items:center;gap:8px;color:${WHITE};font-size:12px;font-weight:600;pointer-events:auto;text-decoration:none;letter-spacing:0.3px;">
      <span style="font-weight:800;">MyFinalPlaybook</span>
      <span style="color:rgba(255,255,255,0.55);font-weight:500;">Powered by</span>
      <img src="${PDF_LOGO_DATA_URI}" alt="ENDevo" style="height:18px;width:auto;display:block;vertical-align:middle;"/>
    </a>
  </div>`;
}

// ── SVG donut chart ────────────────────────────────────────────

function donutChart(result: AssessmentResult): string {
  const cx = 70, cy = 70, r = 52, sw = 20;
  const circ = 2 * Math.PI * r;
  const maxTotal = result.domainResults.length * 6;
  const total = result.domainResults.reduce((s, d) => s + d.score, 0);
  const avgPct = Math.round((total / maxTotal) * 100);

  // Full-ring donut: each slice is sized by that domain's SHARE of the total
  // score, so the four slices together fill the whole ring. A small gap (2px
  // of arc) separates adjacent slices for legibility. The gray base circle
  // shows through only when total is 0.
  const GAP = total > 0 ? 2 : 0; // px of arc reserved between slices
  const gapCount = result.domainResults.length;
  const drawable = circ - GAP * gapCount;

  let offset = 0;
  const slices = result.domainResults.map((dr) => {
    const frac = total > 0 ? dr.score / total : 1 / result.domainResults.length;
    const dash = frac * drawable;
    const slice = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${DOMAIN_CLR[dr.domain] ?? ORANGE}" stroke-width="${sw}"
      stroke-linecap="butt"
      stroke-dasharray="${dash} ${circ - dash}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash + GAP;
    return slice;
  }).join("");

  // Legend as a 2-column grid sitting beneath the donut.
  const legend = result.domainResults.map((dr) => `
    <div style="display:flex;align-items:center;gap:5px;">
      <div style="width:9px;height:9px;border-radius:50%;background:${DOMAIN_CLR[dr.domain] ?? ORANGE};"></div>
      <span style="font-size:11px;color:${TEXT_MID};">${dr.domain}</span>
    </div>`).join("");

  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
    <svg width="150" height="150" viewBox="0 0 140 140">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY_BAR}" stroke-width="${sw}"/>
      ${slices}
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="24" font-weight="900" fill="${TEXT_DARK}">${avgPct}%</text>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="9" fill="${TEXT_MUTE}" letter-spacing="0.5">avg</text>
    </svg>
    <div style="display:grid;grid-template-columns:auto auto;gap:6px 18px;">${legend}</div>
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

  // Each journey marker links to its matching day block on the plan page
  // (id="day-N"), so the page-1 journey acts as a tappable table of contents.
  const journeyDots = result.plan.map((d, i) => `
    <a href="#day-${d.day}" style="display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;color:inherit;">
      <div style="width:44px;height:44px;border-radius:50%;
        background:${i === 0 ? ORANGE : "transparent"};
        border:2px solid ${i === 0 ? ORANGE : GRAY_BAR};
        color:${i === 0 ? WHITE : TEXT_MUTE};
        font-weight:800;font-size:15px;
        display:flex;align-items:center;justify-content:center;">${d.day}</div>
      <div style="font-size:10px;font-weight:${i === 0 ? "700" : "400"};color:${i === 0 ? ORANGE : TEXT_MUTE};">
        ${i === 0 ? "Today" : `Day ${d.day}`}
      </div>
    </a>`).join("");

  const bandDesc =
    result.band === "AT RISK"
      ? "You're not alone -- most people are here. This week we start closing the biggest gaps."
      : result.band === "SOMEWHAT PREPARED"
      ? "You have started but gaps remain. This week we close the most important ones."
      : "You are prepared. This week we sharpen the edges.";

  return `
  <div class="sheet" style="background:${WHITE};">
    ${pageHeader("Legacy Readiness Assessment", `${result.name} · ${dateStr}`)}

    <div style="padding:36px 40px 32px;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;">

      <!-- Score hero row: score + band on the left, Jesse on the right -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:34px;">
        <div>
          <div class="display" style="font-size:90px;font-weight:800;color:${TEXT_DARK};line-height:0.95;letter-spacing:-3px;">${result.percentReady}%</div>
          <div style="font-size:10px;font-weight:700;color:${TEXT_MUTE};letter-spacing:2px;text-transform:uppercase;margin-top:8px;margin-bottom:14px;">AVERAGE READINESS</div>
          <div style="display:inline-block;background:${bandColor};color:${WHITE};font-weight:800;font-size:13px;padding:7px 20px;border-radius:4px;margin-bottom:14px;">${result.band}</div>
          <div style="font-size:12.5px;color:${TEXT_MID};line-height:1.7;max-width:330px;">${bandDesc}</div>
        </div>
        <img src="${PDF_JESSE_DATA_URI}" alt="Jesse" style="width:150px;height:150px;border-radius:50%;display:block;border:3px solid ${ORANGE};margin-top:6px;"/>
      </div>

      <!-- Score breakdown: domain bars on the left, donut on the right -->
      <div style="border-top:1px solid ${GRAY_BAR};padding-top:20px;margin-bottom:24px;">
        <div style="font-size:10px;font-weight:700;color:${TEXT_MUTE};letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">YOUR SCORE BREAKDOWN</div>
        <div style="display:flex;align-items:center;gap:32px;">
          <div style="flex:1;">${domainBars}</div>
          <div style="flex-shrink:0;">${donutChart(result)}</div>
        </div>
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
  <div id="day-${day}" style="display:flex;gap:0;margin-bottom:4px;page-break-inside:avoid;">
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
  <div class="sheet" style="background:${WHITE};">
    ${pageHeader("Your 7-Day Legacy Plan", subtitle)}
    <div style="padding:28px 40px;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;">
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
  /* Use system fonts only. A networked @import (e.g. Google Fonts) makes
     expo-print's WebView block on a network fetch while rendering the PDF —
     if that request hangs or aborts on the device, the file never generates
     and nothing opens. System fonts render instantly and offline. */
  @page { margin: 0; size: A4 portrait; }
  * { box-sizing: border-box; margin: 0; padding: 0;
      font-family: -apple-system, 'Helvetica Neue', 'Roboto', Arial, sans-serif;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1, h2, h3, .display { font-family: -apple-system, 'Helvetica Neue', 'Roboto', Arial, sans-serif; font-weight: 800; }
  body { background: #fff; }
  a { color: inherit; text-decoration: none; }
  /* Each .sheet is exactly one printed page. We use a fixed 296mm height (1mm
     under A4's 297mm) plus overflow:hidden so a sub-pixel rounding overflow
     can never spill a near-blank "page 2". Subsequent sheets force a clean
     page break before themselves — no trailing/empty pages. */
  .sheet { width: 210mm; height: 296mm; overflow: hidden; display: flex; flex-direction: column; }
  .sheet + .sheet { page-break-before: always; }
</style>
</head>
<body>
  ${scorePage(result, dateStr)}
  ${planPages(result)}
</body>
</html>`;
}

export function buildPdfFilename(name: string): string {
  const d    = new Date();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  // Title-case the name and keep it readable: "MyFinalPlaybook-Nimmi-06-28-2026".
  const safe = name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-")
    .replace(/[^A-Za-z0-9-]/g, "");
  return `MyFinalPlaybook-${safe || "Plan"}-${mm}-${dd}-${yyyy}`;
}

export async function downloadPDF(result: AssessmentResult): Promise<void> {
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const html = buildPdfHtml(result, dateStr);

  // Web: open the branded HTML as a real blob: URL in a new tab. (Writing into
  // a blank window via document.write is blocked by many browsers and leaves an
  // empty "about:blank" tab — a blob URL renders reliably and isn't pop-up
  // blocked the same way.) User then presses Ctrl+P → Save as PDF.
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    // If the browser blocked the pop-up, fall back to navigating via a link.
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    // Release the blob URL after the new tab has had time to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }

  // Native: generate the PDF, then save it to the device.
  const filename = `${buildPdfFilename(result.name)}.pdf`;

  // Generate the PDF file. Race against a timeout so a hung WebView render
  // can't leave the button spinning forever.
  const tmpUri = await Promise.race<string>([
    Print.printToFileAsync({ html, base64: false }).then((r) => r.uri),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("printToFileAsync timed out")), 12000)
    ),
  ]).catch(() => "");

  if (!tmpUri) {
    // Generation failed — fall back to the interactive print dialog.
    await Print.printAsync({ html });
    return;
  }

  // ── Android: save straight to the public Downloads folder, then toast. ──
  if (Platform.OS === "android") {
    try {
      const base64 = await FileSystem.readAsStringAsync(tmpUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Ask once for a save location (cached after first grant); default to
      // the Downloads tree. Then create the file there and write the PDF.
      const perm =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (perm.granted) {
        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
          perm.directoryUri,
          filename,
          "application/pdf"
        );
        await FileSystem.writeAsStringAsync(destUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        ToastAndroid.show("Saved to your selected folder ✓", ToastAndroid.LONG);
        return;
      }
      // User declined the folder picker — fall back to sharing the file.
    } catch {
      // Any failure → fall back to the share sheet below.
    }
  }

  // ── iOS (and Android fallback): share/save via the OS sheet. ──
  // Copy into cache under our filename so the sheet shows the right name and
  // the file:// is readable (raw printToFile cache paths are blocked on
  // Android 14+).
  let shareUri = tmpUri;
  try {
    const destUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.deleteAsync(destUri, { idempotent: true });
    await FileSystem.copyAsync({ from: tmpUri, to: destUri });
    if ((await FileSystem.getInfoAsync(destUri)).exists) shareUri = destUri;
  } catch {
    /* use tmpUri */
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(shareUri, {
      mimeType: "application/pdf",
      dialogTitle: filename,
      UTI: "com.adobe.pdf",
    });
  } else {
    Alert.alert("Saved", `Your plan was saved as ${filename}.`);
  }
}
