const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const axios = require("axios");
const cheerio = require("cheerio");

puppeteer.use(StealthPlugin());

const MAX_RETRIES = 2;
const RETRY_DELAY = 3000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupBrowser() {
  return await puppeteer.launch({
    headless: "new",
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
    defaultViewport: { width: 1920, height: 1080 },
  });
}

// ═══════════════════════════════════════════════════════════
//  BUS — Shohoz  (Puppeteer with form interaction)
// ═══════════════════════════════════════════════════════════
async function scrapeBuses(from, to, date) {
  const buses = [];
  let browser;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      browser = await setupBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(randomUseragent.getRandom());

      // Navigate to Shohoz bus page & interact with the search form
      console.log(
        `\x1b[34m[Bus] Attempt ${attempt}/${MAX_RETRIES} — Loading Shohoz\x1b[0m`
      );

      await page.goto("https://www.shohoz.com", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Try to fill the search form
      // Look for the from/to input fields
      const fromSelectors = [
        'input[placeholder*="From"]',
        'input[id*="from"]',
        'input[name*="from"]',
        "#fromCity",
        ".from-city input",
      ];
      const toSelectors = [
        'input[placeholder*="To"]',
        'input[id*="to"]',
        'input[name*="to"]',
        "#toCity",
        ".to-city input",
      ];

      let fromInput = null;
      let toInput = null;

      for (const sel of fromSelectors) {
        fromInput = await page.$(sel);
        if (fromInput) break;
      }
      for (const sel of toSelectors) {
        toInput = await page.$(sel);
        if (toInput) break;
      }

      if (fromInput && toInput) {
        // Type in the from city
        await fromInput.click({ clickCount: 3 });
        await fromInput.type(from, { delay: 50 });
        await delay(1500);
        // Select the first suggestion
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await delay(500);

        // Type in the to city
        await toInput.click({ clickCount: 3 });
        await toInput.type(to, { delay: 50 });
        await delay(1500);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await delay(500);

        // Try clicking search button
        const searchBtn = await page.$(
          'button[type="submit"], .search-btn, button[class*="search"], button[class*="Search"]'
        );
        if (searchBtn) {
          await searchBtn.click();
          await page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: 20000,
          }).catch(() => {});
          await delay(3000);
        }
      } else {
        // Fallback — try the direct URL format
        const directUrl = `https://www.shohoz.com/bus-tickets/${encodeURIComponent(
          from.toLowerCase()
        )}-to-${encodeURIComponent(to.toLowerCase())}`;
        console.log(`\x1b[33m[Bus] Form not found, trying direct URL:\x1b[0m ${directUrl}`);
        await page.goto(directUrl, { waitUntil: "networkidle2", timeout: 30000 });
        await delay(3000);
      }

      // Now try to find bus results on the page
      const resultSelectors = [
        ".trip-item",
        ".bus-list-item",
        '[class*="tripItem"]',
        '[class*="TripItem"]',
        ".search-result-item",
        '[data-testid="trip-card"]',
      ];

      let resultSelector = null;
      for (const sel of resultSelectors) {
        const elements = await page.$$(sel);
        if (elements.length > 0) {
          resultSelector = sel;
          console.log(
            `\x1b[32m[Bus] Found ${elements.length} results with selector: ${sel}\x1b[0m`
          );
          break;
        }
      }

      if (!resultSelector) {
        // Try scraping whatever is on the page
        const pageText = await page.evaluate(() => document.body.innerText);
        console.warn(
          `\x1b[33m[Bus] No bus listing selectors matched. Page has ${pageText.length} chars of text.\x1b[0m`
        );
        break;
      }

      const results = await page.evaluate((sel) => {
        const items = document.querySelectorAll(sel);
        return Array.from(items).map((item) => {
          const getText = (...sels) => {
            for (const s of sels) {
              const el = item.querySelector(s);
              if (el?.innerText?.trim()) return el.innerText.trim();
            }
            return null;
          };

          return {
            type: "bus",
            name:
              getText(
                '[class*="operator"]',
                '[class*="Operator"]',
                '[class*="company"]',
                "h3",
                "h4",
                ".name"
              ) || "Bus Service",
            provider:
              getText('[class*="operator"]', '[class*="company"]') ||
              "Unknown",
            price: parseFloat(
              getText(
                '[class*="fare"]',
                '[class*="Fare"]',
                '[class*="price"]',
                '[class*="Price"]'
              )?.replace(/[^0-9.]/g, "") || "0"
            ),
            duration:
              getText('[class*="duration"]', '[class*="Duration"]') ||
              "Unknown",
            departureTime:
              getText(
                '[class*="departure"]',
                '[class*="Departure"]',
                '[class*="start"]'
              ) || "See website",
            arrivalTime:
              getText(
                '[class*="arrival"]',
                '[class*="Arrival"]',
                '[class*="end"]'
              ) || "See website",
            rating: "N/A",
            imageUrl: null,
            description: "",
            bookingLink: item.querySelector("a")?.href || null,
            source: "Shohoz",
          };
        });
      }, resultSelector);

      if (results.length > 0) {
        buses.push(...results.filter((b) => b.price > 0 || b.name !== "Bus Service"));
      }

      console.log(`\x1b[32m[Bus] Found ${buses.length} bus results\x1b[0m`);
      break;
    } catch (error) {
      console.error(
        `\x1b[31m[Bus] Attempt ${attempt}/${MAX_RETRIES} failed:\x1b[0m`,
        error.message
      );
      if (attempt < MAX_RETRIES) {
        console.log(`\x1b[33m[Bus] Retrying in ${RETRY_DELAY / 1000}s...\x1b[0m`);
        await delay(RETRY_DELAY);
      }
    } finally {
      if (browser) await browser.close();
    }
  }

  return buses;
}

// ═══════════════════════════════════════════════════════════
//  TRAINS — Bangladesh Railway (scrape schedule info)
// ═══════════════════════════════════════════════════════════
async function scrapeTrains(from, to) {
  try {
    console.log(`\x1b[34m[Train] Searching trains: ${from} → ${to}\x1b[0m`);

    // Try the Bangladesh Railway e-ticketing site
    const url = `https://eticket.railway.gov.bd/booking/train/search?fromcity=${encodeURIComponent(
      from
    )}&tocity=${encodeURIComponent(to)}&doj=${new Date()
      .toISOString()
      .split("T")[0]}&class=S_CHAIR`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": randomUseragent.getRandom(),
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const trains = [];

    // Try multiple selectors for train results
    const selectors = [
      ".single-trip-wrapper",
      ".train-info",
      '[class*="trainCard"]',
      ".trip-card",
      "table tbody tr",
    ];

    for (const sel of selectors) {
      const elements = $(sel);
      if (elements.length > 0) {
        console.log(
          `\x1b[32m[Train] Found ${elements.length} results with selector: ${sel}\x1b[0m`
        );
        elements.each((_, el) => {
          const getName = (...sels) => {
            for (const s of sels) {
              const text = $(el).find(s).text().trim();
              if (text) return text;
            }
            return null;
          };

          const train = {
            type: "train",
            name: getName(".train-name", "h3", "h4", "td:first-child") || "Train",
            provider: "Bangladesh Railway",
            price: parseFloat(
              getName(".fare", ".price", "td:last-child")?.replace(
                /[^0-9.]/g,
                ""
              ) || "0"
            ),
            duration: getName(".duration", ".time-diff") || "See website",
            departureTime:
              getName(".departure", ".dep-time", "td:nth-child(2)") ||
              "See website",
            arrivalTime:
              getName(".arrival", ".arr-time", "td:nth-child(3)") ||
              "See website",
            rating: "N/A",
            imageUrl: null,
            description: "",
            bookingLink: "https://eticket.railway.gov.bd",
            source: "Bangladesh Railway",
          };

          if (train.name !== "Train") {
            trains.push(train);
          }
        });
        break;
      }
    }

    console.log(`\x1b[32m[Train] Found ${trains.length} train results\x1b[0m`);
    return trains;
  } catch (error) {
    console.error("\x1b[31m[Train] Error:\x1b[0m", error.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
//  FLIGHTS — Google Flights redirect links (Cheerio)
// ═══════════════════════════════════════════════════════════
async function scrapeFlights(from, to, date) {
  let browser;
  try {
    console.log(
      `\x1b[34m[Flight] Searching flights: ${from} → ${to} on ${date}\x1b[0m`
    );

    browser = await setupBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());

    // Use Google Flights — it's the most reliable flight search
    const url = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(
      from
    )}+to+${encodeURIComponent(to)}+on+${date}`;

    console.log(`\x1b[34m[Flight] Navigating to:\x1b[0m ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    await delay(3000);

    // Google Flights uses specific selectors
    const flightSelectors = [
      '[class*="pIav2d"]',  // Flight result rows
      'li[class*="flight"]',
      '[data-test-id="offer"]',
      ".flight-card",
      'ul[class*="Rk10dc"] li',
    ];

    let resultSelector = null;
    for (const sel of flightSelectors) {
      const elements = await page.$$(sel);
      if (elements.length > 0) {
        resultSelector = sel;
        console.log(
          `\x1b[32m[Flight] Found ${elements.length} results with selector: ${sel}\x1b[0m`
        );
        break;
      }
    }

    if (!resultSelector) {
      console.warn(
        "\x1b[33m[Flight] No flight results found. Selectors may have changed.\x1b[0m"
      );
      return [];
    }

    const flights = await page.evaluate((sel) => {
      const items = document.querySelectorAll(sel);
      return Array.from(items)
        .slice(0, 10)
        .map((item) => {
          // Google Flights uses various class names
          const allText = item.innerText || "";
          const lines = allText.split("\n").filter((l) => l.trim());

          // Try to extract structured data
          const priceMatch = allText.match(/[৳$€£][\s]?[\d,]+/);
          const timeMatch = allText.match(
            /\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?/g
          );
          const durationMatch = allText.match(
            /\d+\s*(?:hr?|hour)s?\s*(?:\d+\s*(?:min|m))?/i
          );

          return {
            type: "flight",
            name: lines[0] || "Flight",
            provider: lines.find((l) => /airline|air|biman|novo|us-bangla/i.test(l)) || lines[0] || "Airline",
            price: priceMatch
              ? parseFloat(priceMatch[0].replace(/[^0-9.]/g, ""))
              : 0,
            duration: durationMatch ? durationMatch[0] : "See website",
            departureTime: timeMatch?.[0] || "See website",
            arrivalTime: timeMatch?.[1] || "See website",
            rating: "N/A",
            imageUrl: null,
            description: lines.slice(0, 3).join(" | "),
            bookingLink: "https://www.google.com/travel/flights",
            source: "Google Flights",
          };
        })
        .filter((f) => f.price > 0);
    }, resultSelector);

    console.log(`\x1b[32m[Flight] Found ${flights.length} flight results\x1b[0m`);
    return flights;
  } catch (error) {
    console.error("\x1b[31m[Flight] Error:\x1b[0m", error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

// ═══════════════════════════════════════════════════════════
//  AGGREGATE — Run all transport scrapers concurrently
// ═══════════════════════════════════════════════════════════
async function getAllTransportation(from, to, date) {
  console.log(
    `\x1b[34mStarting transportation scraping: ${from} → ${to} on ${date}\x1b[0m`
  );

  try {
    const results = await Promise.allSettled([
      scrapeBuses(from, to, date),
      scrapeTrains(from, to),
      scrapeFlights(from, to, date),
    ]);

    const sourceNames = ["Buses", "Trains", "Flights"];
    const allResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        console.log(
          `\x1b[32m${sourceNames[index]}: Found ${result.value.length} results\x1b[0m`
        );
        return result.value;
      } else {
        console.error(
          `\x1b[31m${sourceNames[index]} scraping failed:\x1b[0m`,
          result.reason?.message || result.reason
        );
        return [];
      }
    });

    const allTransportation = allResults.flat();
    const sorted = allTransportation.sort((a, b) => a.price - b.price);

    console.log(
      `\x1b[32mFound ${sorted.length} total transportation options\x1b[0m`
    );
    return sorted;
  } catch (error) {
    console.error(
      "\x1b[31mTransportation scraping error:\x1b[0m",
      error.message
    );
    return [];
  }
}

module.exports = {
  getAllTransportation,
};
