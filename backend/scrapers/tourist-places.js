const axios = require("axios");

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_HEADERS = {
  "User-Agent": "TravelComparisonBot/1.0 (educational project)",
  Accept: "application/json",
};

/**
 * Search Wikipedia for articles related to a query.
 */
async function searchWikipedia(query, limit = 10) {
  const { data } = await axios.get(WIKI_API, {
    params: {
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
      srlimit: limit,
      origin: "*",
    },
    headers: WIKI_HEADERS,
    timeout: 10000,
  });
  return data.query?.search || [];
}

/**
 * Get page details (extract + thumbnail + URL) for a list of page titles.
 */
async function getPageDetails(titles) {
  if (titles.length === 0) return [];

  const { data } = await axios.get(WIKI_API, {
    params: {
      action: "query",
      titles: titles.join("|"),
      prop: "extracts|pageimages|info",
      exintro: true,
      explaintext: true,
      pithumbsize: 500,
      inprop: "url",
      format: "json",
      origin: "*",
    },
    headers: WIKI_HEADERS,
    timeout: 10000,
  });

  return Object.values(data.query?.pages || {}).filter(
    (p) => p.pageid && p.pageid > 0
  );
}

/**
 * Try fetching tourist-attractions from Wikivoyage as well.
 */
async function searchWikivoyage(location) {
  try {
    const { data } = await axios.get(
      "https://en.wikivoyage.org/w/api.php",
      {
        params: {
          action: "query",
          list: "search",
          srsearch: location,
          format: "json",
          srlimit: 5,
          origin: "*",
        },
        headers: WIKI_HEADERS,
        timeout: 10000,
      }
    );

    const results = data.query?.search || [];
    if (results.length === 0) return [];

    const titles = results.map((r) => r.title);
    const { data: detailData } = await axios.get(
      "https://en.wikivoyage.org/w/api.php",
      {
        params: {
          action: "query",
          titles: titles.join("|"),
          prop: "extracts|pageimages|info",
          exintro: true,
          explaintext: true,
          pithumbsize: 500,
          inprop: "url",
          format: "json",
          origin: "*",
        },
        headers: WIKI_HEADERS,
        timeout: 10000,
      }
    );

    return Object.values(detailData.query?.pages || {})
      .filter((p) => p.pageid && p.pageid > 0)
      .map((page) => ({
        name: page.title,
        description: page.extract
          ? page.extract.substring(0, 300) + (page.extract.length > 300 ? "..." : "")
          : "Travel guide available on Wikivoyage",
        rating: "N/A",
        reviewCount: "Wikivoyage",
        category: "Travel Guide",
        imageUrl: page.thumbnail?.source || null,
        link:
          page.fullurl ||
          `https://en.wikivoyage.org/wiki/${encodeURIComponent(page.title)}`,
        source: "Wikivoyage",
      }));
  } catch (err) {
    console.error("[Wikivoyage] Error:", err.message);
    return [];
  }
}

/**
 * Main function — searches Wikipedia + Wikivoyage for tourist info
 * about a given location.
 */
async function scrapeTouristPlaces(location) {
  console.log(
    `\x1b[34mStarting tourist places search for "${location}" via Wikipedia API\x1b[0m`
  );

  try {
    // ── 1. Search Wikipedia with multiple queries ───────────
    const queries = [
      `${location} tourist attractions Bangladesh`,
      `${location} landmarks places to visit`,
      `things to do in ${location}`,
    ];

    const searchBatches = await Promise.all(
      queries.map((q) => searchWikipedia(q, 5))
    );

    // Deduplicate by pageid
    const allHits = searchBatches.flat();
    const uniqueHits = [
      ...new Map(allHits.map((r) => [r.pageid, r])).values(),
    ];

    // ── 2. Get full page details from Wikipedia ─────────────
    let wikiPlaces = [];
    if (uniqueHits.length > 0) {
      const titles = uniqueHits.map((r) => r.title);
      const pages = await getPageDetails(titles);
      wikiPlaces = pages.map((page) => ({
        name: page.title,
        description: page.extract
          ? page.extract.substring(0, 300) +
            (page.extract.length > 300 ? "..." : "")
          : "No description available",
        rating: "N/A",
        reviewCount: "Wikipedia",
        category: "Tourist Attraction",
        imageUrl: page.thumbnail?.source || null,
        link:
          page.fullurl ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        source: "Wikipedia",
      }));
    }

    // ── 3. Also try Wikivoyage (travel-focused wiki) ────────
    const voyagePlaces = await searchWikivoyage(location);

    // ── 4. Merge & deduplicate ──────────────────────────────
    const merged = [...wikiPlaces, ...voyagePlaces];
    const unique = [
      ...new Map(merged.map((p) => [p.name, p])).values(),
    ];

    console.log(
      `\x1b[32mFound ${unique.length} tourist places (${wikiPlaces.length} Wikipedia + ${voyagePlaces.length} Wikivoyage)\x1b[0m`
    );
    return unique;
  } catch (error) {
    console.error(
      "\x1b[31mTourist places scraping error:\x1b[0m",
      error.message
    );
    return [];
  }
}

module.exports = {
  scrapeTouristPlaces,
};
