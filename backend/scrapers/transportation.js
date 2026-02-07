const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");

puppeteer.use(StealthPlugin());

const MAX_RETRIES = 2;
const RETRY_DELAY = 3000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupBrowser() {
  return await puppeteer.launch({
    headless: true,
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

async function scrapeBuses(from, to, date) {
  const buses = [];
  let browser;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      browser = await setupBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(randomUseragent.getRandom());

      const url = `https://www.shohoz.com/bus/search?fromCity=${encodeURIComponent(
        from
      )}&toCity=${encodeURIComponent(to)}&doj=${date}`;

      console.log(
        `\x1b[34m[Bus] Attempt ${attempt}/${MAX_RETRIES} — Navigating to:\x1b[0m ${url}`
      );

      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      try {
        await page.waitForSelector(".bus-list-item", { timeout: 15000 });
        console.log("\x1b[32m[Bus] Bus listings found on page.\x1b[0m");
      } catch {
        console.warn(
          "\x1b[33m[Bus] No bus listings found. Selector may have changed.\x1b[0m"
        );
        break;
      }

      const results = await page.evaluate(() => {
        const items = document.querySelectorAll(".bus-list-item");
        return Array.from(items).map((item) => ({
          type: "bus",
          name:
            item.querySelector(".operator-name")?.innerText?.trim() ||
            "Unknown",
          provider:
            item.querySelector(".operator-name")?.innerText?.trim() ||
            "Unknown",
          price: parseFloat(
            item
              .querySelector(".fare")
              ?.innerText?.replace(/[^0-9.]/g, "") || "0"
          ),
          duration:
            item.querySelector(".duration")?.innerText?.trim() || "Unknown",
          departureTime:
            item.querySelector(".departure-time")?.innerText?.trim() ||
            "Unknown",
          arrivalTime:
            item.querySelector(".arrival-time")?.innerText?.trim() ||
            "Unknown",
          rating:
            item.querySelector(".rating")?.innerText?.trim() || "Not rated",
          imageUrl: item.querySelector(".image")?.getAttribute("src") || null,
          description:
            item.querySelector(".description")?.innerText?.trim() || "",
          bookingLink:
            item.querySelector(".booking-link")?.getAttribute("href") || null,
          source: "Shohoz",
        }));
      });

      if (results.length > 0) {
        buses.push(...results.filter((bus) => bus.price > 0));
      }

      console.log(`\x1b[32m[Bus] Found ${buses.length} bus results\x1b[0m`);
      break; // Success, exit retry loop
    } catch (error) {
      console.error(
        `\x1b[31m[Bus] Attempt ${attempt}/${MAX_RETRIES} failed:\x1b[0m`,
        error.message
      );
      if (attempt < MAX_RETRIES) {
        console.log(
          `\x1b[33m[Bus] Retrying in ${RETRY_DELAY / 1000}s...\x1b[0m`
        );
        await delay(RETRY_DELAY);
      }
    } finally {
      if (browser) await browser.close();
    }
  }

  return buses;
}

async function scrapeFlights(from, to, date) {
  const flights = [];
  let browser;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      browser = await setupBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(randomUseragent.getRandom());

      const url = `https://www.biman-airlines.com/search?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}&date=${date}`;

      console.log(
        `\x1b[34m[Flight] Attempt ${attempt}/${MAX_RETRIES} — Navigating to:\x1b[0m ${url}`
      );

      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      try {
        await page.waitForSelector(".flight-item", { timeout: 15000 });
        console.log(
          "\x1b[32m[Flight] Flight listings found on page.\x1b[0m"
        );
      } catch {
        console.warn(
          "\x1b[33m[Flight] No flight listings found. Selector may have changed.\x1b[0m"
        );
        break;
      }

      const results = await page.evaluate(() => {
        const items = document.querySelectorAll(".flight-item");
        return Array.from(items).map((item) => ({
          type: "flight",
          name:
            item.querySelector(".airline-name")?.innerText?.trim() ||
            "Unknown",
          provider:
            item.querySelector(".airline-name")?.innerText?.trim() ||
            "Unknown",
          price: parseFloat(
            item
              .querySelector(".price")
              ?.innerText?.replace(/[^0-9.]/g, "") || "0"
          ),
          duration:
            item.querySelector(".duration")?.innerText?.trim() || "Unknown",
          departureTime:
            item.querySelector(".departure-time")?.innerText?.trim() ||
            "Unknown",
          arrivalTime:
            item.querySelector(".arrival-time")?.innerText?.trim() ||
            "Unknown",
          rating:
            item.querySelector(".rating")?.innerText?.trim() || "Not rated",
          imageUrl: item.querySelector(".image")?.getAttribute("src") || null,
          description:
            item.querySelector(".description")?.innerText?.trim() || "",
          bookingLink:
            item.querySelector(".booking-link")?.getAttribute("href") || null,
          source: "Biman Airlines",
        }));
      });

      if (results.length > 0) {
        flights.push(...results.filter((flight) => flight.price > 0));
      }

      console.log(
        `\x1b[32m[Flight] Found ${flights.length} flight results\x1b[0m`
      );
      break; // Success, exit retry loop
    } catch (error) {
      console.error(
        `\x1b[31m[Flight] Attempt ${attempt}/${MAX_RETRIES} failed:\x1b[0m`,
        error.message
      );
      if (attempt < MAX_RETRIES) {
        console.log(
          `\x1b[33m[Flight] Retrying in ${RETRY_DELAY / 1000}s...\x1b[0m`
        );
        await delay(RETRY_DELAY);
      }
    } finally {
      if (browser) await browser.close();
    }
  }

  return flights;
}

async function getAllTransportation(from, to, date) {
  console.log(
    `\x1b[34mStarting transportation scraping: ${from} → ${to} on ${date}\x1b[0m`
  );

  try {
    const results = await Promise.allSettled([
      scrapeBuses(from, to, date),
      scrapeFlights(from, to, date),
    ]);

    const sourceNames = ["Buses", "Flights"];
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

    // Sort by price (lowest first)
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
