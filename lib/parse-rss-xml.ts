import { XMLParser } from "fast-xml-parser";

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export const MAX_RSS_XML_CHARS = 2_000_000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (tagName: string) =>
    tagName === "item" || tagName === "entry" || tagName === "link",
  trimValues: true,
  // Feeds like The Guardian embed many &...; entities in descriptions
  processEntities: {
    maxEntityCount: 50_000,
    maxTotalExpansions: 50_000,
  },
});

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function textOf(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "#text" in (v as object)) {
    return String((v as { "#text": string })["#text"]);
  }
  return String(v);
}

function extractLink(item: Record<string, unknown>): string {
  const link = item.link;
  if (typeof link === "string") return link.trim();
  if (Array.isArray(link)) {
    for (const l of link) {
      if (typeof l === "object" && l && "@_href" in l) {
        return String((l as { "@_href": string })["@_href"]).trim();
      }
      if (typeof l === "string") return l.trim();
    }
  }
  if (typeof link === "object" && link && "@_href" in link) {
    return String((link as { "@_href": string })["@_href"]).trim();
  }
  const id = item.id;
  if (typeof id === "string" && id.startsWith("http")) return id.trim();
  return "";
}

function extractPubDate(item: Record<string, unknown>): string | null {
  const raw =
    textOf(item.pubDate) ||
    textOf(item.published) ||
    textOf(item.updated) ||
    textOf(item["dc:date"]);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Parses RSS 2.0 or Atom-ish XML into news articles (up to maxItems per feed).
 */
export function articlesFromRssXml(
  xml: string,
  source: string,
  maxItems: number
): NewsArticle[] {
  const trimmed =
    xml.length > MAX_RSS_XML_CHARS
      ? xml.slice(0, MAX_RSS_XML_CHARS)
      : xml;

  let parsed: unknown;
  try {
    parsed = parser.parse(trimmed);
  } catch {
    return [];
  }

  const root = parsed as Record<string, unknown>;
  const channel = (root.rss as { channel?: unknown } | undefined)?.channel;
  const feed = root.feed as Record<string, unknown> | undefined;

  const container = (channel || feed) as Record<string, unknown> | undefined;
  if (!container) return [];

  const rawItems = container.item ?? container.entry;
  const items: Record<string, unknown>[] = Array.isArray(rawItems)
    ? (rawItems as Record<string, unknown>[])
    : rawItems
      ? [rawItems as Record<string, unknown>]
      : [];

  const fallbackDate = "2000-01-01T00:00:00.000Z";
  const out: NewsArticle[] = [];

  for (const item of items.slice(0, maxItems)) {
    const titleRaw = textOf(item.title);
    const title = decodeHtmlEntities(titleRaw.trim().replace(/<!\[CDATA\[|\]\]>/g, ""));
    const url = extractLink(item).replace(/<!\[CDATA\[|\]\]>/g, "");

    if (!title || !url) continue;

    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedSource = source.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (
      normalizedSource.includes(normalizedTitle) ||
      normalizedTitle === normalizedSource
    ) {
      continue;
    }

    const publishedAt = extractPubDate(item) ?? fallbackDate;
    out.push({ title, source, url, publishedAt });
  }

  return out;
}
