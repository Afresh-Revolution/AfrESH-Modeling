import { parseImageUrls, primaryImageUrl } from "@/lib/imageUrls";
import * as XLSX from "xlsx";

export type ApplicationRow = Record<string, unknown>;

function fmtTimestamp(value: unknown): string {
  if (value == null || value === "") return "";
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function applicationToExportRow(row: ApplicationRow) {
  const photoUrls = parseImageUrls(row.photo_urls);

  return {
    Status: String(row.status ?? "new"),
    Name: String(row.full_name ?? ""),
    Email: String(row.email ?? ""),
    Phone: String(row.phone ?? ""),
    DOB: String(row.date_of_birth ?? ""),
    Height: String(row.height ?? ""),
    City: String(row.city ?? ""),
    Experience: String(row.experience_level ?? ""),
    "About you": typeof row.message === "string" ? row.message : "",
    "Portfolio URL": String(row.portfolio_url ?? ""),
    Photo: primaryImageUrl(photoUrls),
    Interview: fmtTimestamp(row.interview_at),
    Submitted: fmtTimestamp(row.created_at),
  };
}

export function downloadApplicationsExcel(
  applications: ApplicationRow[],
  filename?: string
): void {
  const rows = applications.map(applicationToExportRow);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Submissions");
  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(
    workbook,
    filename ?? `afresh-submissions-${dateStamp}.xlsx`
  );
}

export function applicationSearchHaystack(row: ApplicationRow): string {
  const parts = [
    row.status,
    row.full_name,
    row.email,
    row.phone,
    row.date_of_birth,
    row.height,
    row.city,
    row.experience_level,
    row.portfolio_url,
    row.message,
    row.interview_at,
    row.created_at,
  ];

  return parts
    .filter((part) => part != null && part !== "")
    .map((part) => String(part).toLowerCase())
    .join(" ");
}

export function applicationMatchesSearch(
  row: ApplicationRow,
  query: string
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  return applicationSearchHaystack(row).includes(trimmed.toLowerCase());
}
