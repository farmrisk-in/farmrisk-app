/**
 * Pre-Sowing PDF Generator for Mobile (React Native / Expo)
 * 
 * Generates an authoritative, publication-quality A4 PDF report
 * containing the ICAR pre-sowing agronomic advisory and KVK guidance,
 * and launches the native sharing/saving dialog.
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export interface PreSowingPDFOptions {
  cropName: string;
  stateName: string;
  soilType: string;
  season: string;
  irrigationType: string;
  language?: string;
  ragSourcesUsed?: number;
  sections: {
    sowing_window?: string;
    seed_selection?: string;
    field_preparation?: string;
    fertilizer_plan?: string;
    irrigation?: string;
    weed_management?: string;
    pest_disease?: string;
  };
  kvk?: {
    name?: string;
    district?: string;
    state?: string;
    address?: string;
    host?: string;
    email?: string;
    phone?: string;
  } | null;
}

function formatInline(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(md?: string | null): string {
  if (!md || !md.trim()) {
    return "<p class='empty-text'>No guidelines provided for this section.</p>";
  }

  let text = md.replace(/\\n/g, "\n").trim();
  const lines = text.split("\n");
  const htmlParts: string[] = [];

  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      if (inTable) {
        htmlParts.push("</tbody></table>");
        inTable = false;
        tableHeaderParsed = false;
      }
      if (inBlockquote) {
        htmlParts.push("</blockquote>");
        inBlockquote = false;
      }
      continue;
    }

    // Markdown Table row: starts and ends with |
    if (line.startsWith("|") && line.endsWith("|")) {
      // Check if it's a separator line like | :--- | :--- |
      if (/^\|(\s*:?-+:?\s*\|)+$/.test(line)) {
        tableHeaderParsed = true;
        continue;
      }

      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => formatInline(c.trim()));

      if (!inTable) {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        htmlParts.push("<table class='advisory-table'>");
        inTable = true;
      }

      if (!tableHeaderParsed) {
        htmlParts.push("<thead><tr>");
        cells.forEach((cell) => htmlParts.push(`<th>${cell}</th>`));
        htmlParts.push("</tr></thead><tbody>");
      } else {
        htmlParts.push("<tr>");
        cells.forEach((cell) => htmlParts.push(`<td>${cell}</td>`));
        htmlParts.push("</tr>");
      }
      continue;
    } else if (inTable) {
      htmlParts.push("</tbody></table>");
      inTable = false;
      tableHeaderParsed = false;
    }

    // Blockquote / Callout
    if (line.startsWith(">")) {
      const bqContent = formatInline(line.replace(/^>\s*/, ""));
      if (!inBlockquote) {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        htmlParts.push("<blockquote class='callout'>");
        inBlockquote = true;
      }
      htmlParts.push(`<p>${bqContent}</p>`);
      continue;
    } else if (inBlockquote) {
      htmlParts.push("</blockquote>");
      inBlockquote = false;
    }

    // Headings
    if (line.startsWith("### ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h4>${formatInline(line.replace(/^###\s+/, ""))}</h4>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h3>${formatInline(line.replace(/^##\s+/, ""))}</h3>`);
      continue;
    }

    // Unordered List
    if (/^[-*]\s+/.test(line)) {
      const itemContent = formatInline(line.replace(/^[-*]\s+/, ""));
      if (!inList) {
        htmlParts.push("<ul class='bullet-list'>");
        inList = true;
      }
      htmlParts.push(`<li>${itemContent}</li>`);
      continue;
    } else if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }

    // Numbered List
    if (/^\d+\.\s+/.test(line)) {
      const itemContent = formatInline(line.replace(/^\d+\.\s+/, ""));
      const match = line.match(/^\d+\./);
      const prefix = match ? match[0] : "";
      htmlParts.push(`<div class='numbered-item'><strong>${prefix}</strong> ${itemContent}</div>`);
      continue;
    }

    // Regular paragraph
    htmlParts.push(`<p>${formatInline(line)}</p>`);
  }

  if (inList) htmlParts.push("</ul>");
  if (inTable) htmlParts.push("</tbody></table>");
  if (inBlockquote) htmlParts.push("</blockquote>");

  return htmlParts.join("\n");
}

export async function generatePreSowingPDF(
  options: PreSowingPDFOptions,
): Promise<void> {
  const {
    cropName,
    stateName,
    soilType,
    season,
    irrigationType,
    language = "en",
    ragSourcesUsed = 6,
    sections,
    kvk,
  } = options;

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sectionCards = [
    {
      num: "01",
      title: "Sowing Window & Optimal Timeline",
      content: markdownToHtml(sections.sowing_window),
    },
    {
      num: "02",
      title: "Seed Selection & Varieties",
      content: markdownToHtml(sections.seed_selection),
    },
    {
      num: "03",
      title: "Field Preparation & Tillage",
      content: markdownToHtml(sections.field_preparation),
    },
    {
      num: "04",
      title: "Fertilizer & Nutrient Management Plan",
      content: markdownToHtml(sections.fertilizer_plan),
    },
    {
      num: "05",
      title: "Irrigation Schedule & Moisture Management",
      content: markdownToHtml(sections.irrigation),
    },
    {
      num: "06",
      title: "Weed Management Strategy",
      content: markdownToHtml(sections.weed_management),
    },
    {
      num: "07",
      title: "Pest & Disease Surveillance Calendar",
      content: markdownToHtml(sections.pest_disease),
    },
  ];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FarmRisk Pre-Sowing Advisory - ${cropName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .header-card {
      background-color: #ffffff;
      border: 1.5px solid #10b981;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #047857;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }
    .brand-tag {
      font-size: 10px;
      font-weight: 700;
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-type {
      font-size: 11px;
      font-weight: 700;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .grid-params {
      display: flex;
      gap: 10px;
    }
    .param-box {
      flex: 1;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
    }
    .param-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.4px;
      margin-bottom: 2px;
    }
    .param-value {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
      text-transform: capitalize;
    }
    .grounding-bar {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #047857;
      font-weight: 600;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .section-pill {
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
    }
    .section-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .advisory-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11.5px;
      background-color: #ffffff;
    }
    .advisory-table th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 8px 10px;
      border-bottom: 2px solid #cbd5e1;
      border-right: 1px solid #e2e8f0;
      text-align: left;
    }
    .advisory-table td {
      padding: 7px 10px;
      font-size: 11.5px;
      line-height: 1.45;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }
    .advisory-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .advisory-table th:last-child,
    .advisory-table td:last-child {
      border-right: none;
    }
    .callout {
      background-color: #f0fdf4;
      border-left: 3.5px solid #16a34a;
      color: #14532d;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .callout p {
      margin: 0;
    }
    .bullet-list {
      margin: 6px 0;
      padding-left: 18px;
    }
    .bullet-list li {
      margin-bottom: 4px;
      color: #334155;
    }
    .numbered-item {
      margin-bottom: 4px;
      color: #334155;
    }
    h3, h4 {
      color: #0f172a;
      margin: 10px 0 6px 0;
    }
    p {
      margin: 6px 0;
      color: #1e293b;
    }
    .kvk-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .kvk-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .kvk-detail {
      font-size: 11.5px;
      color: #475569;
      margin-bottom: 4px;
    }
    .footer-bar {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- HEADER PANEL -->
  <div class="header-card">
    <div class="header-top">
      <div>
        <div class="brand-title">
          <span>FarmRisk</span>
          <span class="brand-tag">Pre-Sowing Advisory</span>
        </div>
        <div class="brand-subtitle">
          Agronomic Intelligence &amp; ICAR Scientific Package of Practices
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-type">Official Advisory Document</div>
        <div class="doc-date">Generated: ${todayStr}</div>
      </div>
    </div>

    <!-- SELECTIONS SUMMARY -->
    <div class="grid-params">
      <div class="param-box">
        <div class="param-label">Selected Crop</div>
        <div class="param-value">${cropName}</div>
      </div>
      <div class="param-box">
        <div class="param-label">Region / State</div>
        <div class="param-value">${stateName}</div>
      </div>
      <div class="param-box">
        <div class="param-label">Soil Profile</div>
        <div class="param-value">${soilType}</div>
      </div>
      <div class="param-box">
        <div class="param-label">Season &amp; Irrigation</div>
        <div class="param-value">${season} · ${irrigationType}</div>
      </div>
    </div>

    <div class="grounding-bar">
      <span>Grounding: ${ragSourcesUsed} ICAR, SAU &amp; KVK scientific packages synthesized</span>
      <span>Language: ${language.toUpperCase()}</span>
    </div>
  </div>

  <!-- 7 ADVISORY SECTIONS -->
  ${sectionCards
    .map(
      (c) => `
    <div class="card">
      <div class="section-header">
        <span class="section-pill">${c.num}</span>
        <h3 class="section-title">${c.title}</h3>
      </div>
      <div>
        ${c.content}
      </div>
    </div>
  `,
    )
    .join("")}

  <!-- NEAREST KVK SECTION -->
  ${
    kvk
      ? `
    <div class="kvk-card">
      <div class="section-header">
        <span class="section-pill">KVK</span>
        <h3 class="section-title">Nearest Krishi Vigyan Kendra (KVK) Guidance</h3>
      </div>
      <div class="kvk-title">${kvk.name || "Krishi Vigyan Kendra"}</div>
      ${kvk.district && kvk.state ? `<div class="kvk-detail"><strong>Location:</strong> ${kvk.district}, ${kvk.state}</div>` : ""}
      ${kvk.address ? `<div class="kvk-detail"><strong>Address:</strong> ${kvk.address}</div>` : ""}
      ${kvk.host ? `<div class="kvk-detail"><strong>Host Institution:</strong> ${kvk.host}</div>` : ""}
      ${kvk.phone ? `<div class="kvk-detail"><strong>Phone:</strong> ${kvk.phone}</div>` : ""}
      ${kvk.email ? `<div class="kvk-detail"><strong>Email:</strong> ${kvk.email}</div>` : ""}
      <p style="font-size: 11px; color: #64748b; margin-top: 6px;">
        Farmers are encouraged to reach out to their regional KVK for certified seed stock, soil health verification, and field demonstration support.
      </p>
    </div>
  `
      : ""
  }

  <div class="footer-bar">
    FarmRisk Agronomic Intelligence Platform • Designed for verified sustainable farm risk mitigation
  </div>

</body>
</html>
  `.trim();

  // 1. Generate local PDF file
  const file = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // 2. Open native sharing/download dialog
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(file.uri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
      dialogTitle: `FarmRisk Pre-Sowing Advisory - ${cropName}`,
    });
  }
}
