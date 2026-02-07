import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const CURRENCY = process.env.REACT_APP_CURRENCY_SYMBOL || "৳";
const LOCALE = process.env.REACT_APP_LOCALE || "en-BD";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 150000, // 2.5 minutes — scraping can be slow
});

// ── AbortController helper ──────────────────────────────────
let currentController = null;

/**
 * Cancel any in-flight search request.
 * Safe to call even when nothing is pending.
 */
export const cancelSearch = () => {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
};

// ── Search ──────────────────────────────────────────────────
export const searchTravel = async ({
  from,
  to,
  checkIn,
  checkOut,
  guests,
  rooms,
}) => {
  // Cancel previous request if still running
  cancelSearch();
  currentController = new AbortController();

  try {
    const response = await api.post(
      "/search",
      { from, to, checkIn, checkOut, guests, rooms },
      { signal: currentController.signal }
    );
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new Error("Search cancelled");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "The search took too long. Please try again with a simpler query."
      );
    }
    if (error.response) {
      const msg =
        error.response.data?.error ||
        error.response.data?.message ||
        "Failed to fetch travel data";
      throw new Error(msg);
    }
    throw new Error(
      "Network error — please check your connection and try again."
    );
  } finally {
    currentController = null;
  }
};

// ── Health check ────────────────────────────────────────────
export const checkHealth = async () => {
  try {
    const { data } = await api.get("/health");
    return data;
  } catch {
    return { status: "error" };
  }
};

// ── Formatting helpers ──────────────────────────────────────
export const formatPrice = (price) => {
  const num = Number(price);
  if (Number.isNaN(num)) return `${CURRENCY} -`;
  return `${CURRENCY} ${num.toLocaleString(LOCALE)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
