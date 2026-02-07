const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");

puppeteer.use(StealthPlugin());

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

async function scrapeAgodaHotels(location, checkInDate, checkOutDate) {
  let browser;
  try {
    browser = await setupBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());

    // Agoda search URL (text-based search works without city IDs)
    const checkOut =
      checkOutDate ||
      (() => {
        const d = new Date(checkInDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
      })();

    const url = `https://www.agoda.com/search?city=${encodeURIComponent(
      location
    )}&checkIn=${checkInDate}&checkOut=${checkOut}&rooms=1&adults=2&children=0`;

    console.log(`\x1b[34m[Agoda] Navigating to:\x1b[0m ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Wait for hotel listing cards — try multiple selectors
    const selectors = [
      '[data-selenium="hotel-item"]',
      ".PropertyCard__Container",
      ".hotel-list-container li",
      '[data-element-name="property-card"]',
      ".PropertyCardItem",
    ];

    let found = false;
    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 10000 });
        console.log(`\x1b[32m[Agoda] Found results with selector: ${sel}\x1b[0m`);
        found = true;
        break;
      } catch {
        continue;
      }
    }

    if (!found) {
      console.warn(
        "\x1b[33m[Agoda] No hotel cards found. Site may be blocking or selectors changed.\x1b[0m"
      );
      return [];
    }

    const hotels = await page.evaluate(() => {
      // Try different card selectors
      const cardSelectors = [
        '[data-selenium="hotel-item"]',
        ".PropertyCard__Container",
        '[data-element-name="property-card"]',
        ".PropertyCardItem",
      ];

      let cards = [];
      for (const sel of cardSelectors) {
        cards = document.querySelectorAll(sel);
        if (cards.length > 0) break;
      }

      return Array.from(cards)
        .slice(0, 15)
        .map((card) => {
          const nameEl =
            card.querySelector('[data-selenium="hotel-name"]') ||
            card.querySelector(".PropertyCard__HotelName") ||
            card.querySelector("h3") ||
            card.querySelector("a[href*='/hotel/']");

          const priceEl =
            card.querySelector('[data-selenium="display-price"]') ||
            card.querySelector(".PropertyCardPrice__Value") ||
            card.querySelector(".PropertyCard__Price") ||
            card.querySelector('[class*="Price"]');

          const ratingEl =
            card.querySelector('[data-selenium="review-score"]') ||
            card.querySelector(".PropertyCard__ReviewScore") ||
            card.querySelector('[class*="ReviewScore"]');

          const locationEl =
            card.querySelector('[data-selenium="area-city"]') ||
            card.querySelector(".PropertyCard__Location") ||
            card.querySelector('[class*="Location"]');

          const imgEl =
            card.querySelector("img[src*='agoda']") ||
            card.querySelector("img[data-src]") ||
            card.querySelector("img");

          const linkEl = card.querySelector("a[href]");

          return {
            name: nameEl?.innerText?.trim() || null,
            price: parseFloat(
              priceEl?.innerText?.replace(/[^0-9.]/g, "") || "0"
            ),
            rating: ratingEl?.innerText?.trim() || "Not rated",
            location: locationEl?.innerText?.trim() || "",
            bookingLink: linkEl?.href || null,
            amenities: [],
            imageUrl:
              imgEl?.getAttribute("src") ||
              imgEl?.getAttribute("data-src") ||
              null,
            description: "",
            source: "Agoda",
          };
        })
        .filter((h) => h.name && h.price > 0);
    });

    console.log(`\x1b[32m[Agoda] Found ${hotels.length} hotels\x1b[0m`);
    return hotels;
  } catch (error) {
    console.error("\x1b[31m[Agoda] Scraping error:\x1b[0m", error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  scrapeAgodaHotels,
};
