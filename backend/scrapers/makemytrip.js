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

async function scrapeMakeMyTripHotels(location, checkInDate, checkOutDate) {
  let browser;
  try {
    browser = await setupBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());

    // MMT URL: checkin format MMDDYYYY, checkout format MMDDYYYY
    const ciDate = new Date(checkInDate);
    const coDate = checkOutDate
      ? new Date(checkOutDate)
      : new Date(ciDate.getTime() + 86400000);

    const fmtMMT = (d) => {
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}${dd}${yyyy}`;
    };

    const url = `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${fmtMMT(
      ciDate
    )}&checkout=${fmtMMT(coDate)}&city=${encodeURIComponent(
      location
    )}&roomStayQualifier=2e0e&locusId=&country=&locusType=&searchText=${encodeURIComponent(
      location
    )}&regionNearByExp=3&s=popularity`;

    console.log(`\x1b[34m[MakeMyTrip] Navigating to:\x1b[0m ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Try multiple selector strategies
    const selectors = [
      "#listingOuter .listingRow",
      ".hotelCardListing",
      '[data-testid="hotel-card"]',
      "#Jelement .listCont",
      ".makeFlex.hrtlCenter.appendBottom12",
    ];

    let found = false;
    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 10000 });
        console.log(
          `\x1b[32m[MakeMyTrip] Found results with selector: ${sel}\x1b[0m`
        );
        found = true;
        break;
      } catch {
        continue;
      }
    }

    if (!found) {
      console.warn(
        "\x1b[33m[MakeMyTrip] No hotel cards found. Site may be blocking or selectors changed.\x1b[0m"
      );
      return [];
    }

    const hotels = await page.evaluate(() => {
      const cardSelectors = [
        "#listingOuter .listingRow",
        ".hotelCardListing",
        '[data-testid="hotel-card"]',
        "#Jelement .listCont",
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
            card.querySelector(".hotelName, #hlistpg_hotel_name, p.latoBlack") ||
            card.querySelector("p[id*='hotel_name']") ||
            card.querySelector("[class*='hotelName']");

          const priceEl =
            card.querySelector(
              ".actualPrice, #hlistpg_hotel_shown_price, [class*='Price']"
            ) || card.querySelector("p[id*='shown_price']");

          const ratingEl =
            card.querySelector(".rating, [class*='Rating'], [class*='rating']");

          const locationEl = card.querySelector(
            ".areaName, [class*='LocalityName'], [class*='area']"
          );

          const imgEl = card.querySelector("img[src*='http']") || card.querySelector("img");
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
            source: "MakeMyTrip",
          };
        })
        .filter((h) => h.name && h.price > 0);
    });

    console.log(`\x1b[32m[MakeMyTrip] Found ${hotels.length} hotels\x1b[0m`);
    return hotels;
  } catch (error) {
    console.error(
      "\x1b[31m[MakeMyTrip] Scraping error:\x1b[0m",
      error.message
    );
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  scrapeMakeMyTripHotels,
};
