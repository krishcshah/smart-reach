"use client";

/**
 * Tiny client-side CSV parser with auto delimiter detection and UTF-8 support.
 * Good enough for lead/sender files up to ~50k rows in the browser.
 */

function detectDelimiter(firstLine: string): string {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const c of candidates) {
    const count = firstLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvText(text: string): ParsedCsv {
  // strip BOM, normalize newlines
  const clean = text.replace(/^/, "").replace(/\r\n?/g, "\n");
  const lines = clean.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const delimiter = detectDelimiter(lines[0]!);
  const headers = splitLine(lines[0]!, delimiter);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]!, delimiter);
    const row: Record<string, string> = {};
    for (let h = 0; h < headers.length; h++) row[headers[h]!] = cells[h] ?? "";
    rows.push(row);
  }
  return { headers, rows };
}

/** Best-guess mapping of a CSV header to a field key. */
export function guessField(header: string, allowed: { key: string; label: string }[]): string | null {
  const norm = header.trim().toLowerCase().replace(/[\s-]+/g, "_");
  for (const f of allowed) {
    if (norm === f.key || norm === f.label.toLowerCase().replace(/[\s-]+/g, "_")) return f.key;
  }
  // common aliases
  const aliases: Record<string, string> = {
    email_address: "email",
    e_mail: "email",
    mail: "email",
    firstname: "first_name",
    given_name: "first_name",
    lastname: "last_name",
    surname: "last_name",
    organization: "company",
    company_name: "company",
    domain: "website",
    url: "website",
    linkedin_url: "linkedin",
    title: "job_title",
    position: "job_title",
    city: "location",
    country: "location",
    phone_number: "phone",
    telephone: "phone",
    sector: "industry",
    vertical: "industry",
  };
  if (aliases[norm]) return aliases[norm]!;
  return null;
}
