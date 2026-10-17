import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Échappe les caractères spéciaux HTML pour éviter les injections XSS / HTML dans les emails et vues.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Comparaison à temps constant contre les attaques temporelles (Timing Attacks).
 */
export function timingSafeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Valide un format UUID v4 classique.
 */
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Valide un format d'ID Google Spreadsheet.
 */
export function isValidSheetId(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[a-zA-Z0-9_-]{20,100}$/.test(id);
}

/**
 * Assainit une chaîne injectée dans un filtre PostgREST (ex: .or(), .ilike()).
 * Supprime les séparateurs PostgREST et jokers indésirables.
 */
export function sanitizePostgrestFilter(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/[,%()"\\]/g, "").trim();
}

/**
 * Valide qu'une URL utilise strictement HTTP ou HTTPS pour éviter les URI `javascript:`.
 */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Récupère l'IP client de manière plus fiable (support Vercel / reverse proxy).
 */
export function getTrustedClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
