import React, { useState } from "react";
import {
  Container, Box, Typography, Paper, Chip,
  TextField, InputAdornment, Stack
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { generateItinerary, getAIRecommendations } from "../utils/api";
import { useThemeMode } from "../context/ThemeContext";
import {
  FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave,
  FaHeart, FaPlaneDeparture, FaMagic, FaClock, FaUtensils,
  FaLandmark, FaHiking, FaShoppingBag, FaCamera, FaBus,
  FaStar, FaLightbulb, FaChevronDown, FaChevronUp, FaRedo,
  FaSpinner, FaRoute, FaGlobeAmericas,
} from "react-icons/fa";

/* ─── Constants ─── */
const INTEREST_OPTIONS = [
  { id: "culture", label: "Culture", icon: <FaLandmark />, color: "#667eea" },
  { id: "food", label: "Food & Dining", icon: <FaUtensils />, color: "#f5576c" },
  { id: "adventure", label: "Adventure", icon: <FaHiking />, color: "#43a047" },
  { id: "nature", label: "Nature", icon: <FaGlobeAmericas />, color: "#26c6da" },
  { id: "shopping", label: "Shopping", icon: <FaShoppingBag />, color: "#ff9800" },
  { id: "photography", label: "Photography", icon: <FaCamera />, color: "#ab47bc" },
];

const BUDGET_LEVELS = [
  { value: "budget", label: "Budget", desc: "Hostels & street food", icon: "🎒", gradient: "linear-gradient(135deg,#43e97b,#38f9d7)" },
  { value: "moderate", label: "Moderate", desc: "Mid-range comfort", icon: "🏨", gradient: "linear-gradient(135deg,#667eea,#764ba2)" },
  { value: "luxury", label: "Luxury", desc: "5-star experiences", icon: "👑", gradient: "linear-gradient(135deg,#f093fb,#f5576c)" },
];

const ACTIVITY_ICONS = {
  food: <FaUtensils />, sightseeing: <FaCamera />, adventure: <FaHiking />,
  culture: <FaLandmark />, shopping: <FaShoppingBag />, transport: <FaBus />,
  rest: <FaClock />, nightlife: <FaStar />,
  default: <FaMapMarkerAlt />,
};

/* ─── Shared MUI TextField sx ─── */
const tfSx = (dark) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: "14.5px",
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(102,126,234,0.03)",
    backdropFilter: "blur(6px)",
    transition: "all .3s cubic-bezier(.4,0,.2,1)",
    "& fieldset": {
      borderWidth: 2,
      borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(102,126,234,0.18)",
      transition: "all .3s cubic-bezier(.4,0,.2,1)",
    },
    "&:hover fieldset": {
      borderColor: dark ? "rgba(102,126,234,0.4)" : "rgba(102,126,234,0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#667eea !important",
      boxShadow: dark
        ? "0 0 0 4px rgba(102,126,234,0.18)"
        : "0 0 0 4px rgba(102,126,234,0.1)",
    },
    "&.Mui-focused": {
      background: dark ? "rgba(255,255,255,0.07)" : "#fff",
      boxShadow: dark
        ? "0 4px 24px rgba(0,0,0,.25)"
        : "0 4px 24px rgba(102,126,234,0.1)",
    },
  },
  "& .MuiInputAdornment-root svg": { color: "#667eea", fontSize: 16 },
  "& .MuiOutlinedInput-input": {
    color: dark ? "#e0e0f0" : "#333",
    padding: "15px 16px",
    "&::placeholder": { color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.32)", fontWeight: 400 },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "13.5px",
    color: dark ? "#9e9eb8" : "#777",
    "&.Mui-focused": { color: "#667eea" },
  },
});

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
const TripPlanner = () => {
  const { mode } = useThemeMode();
  const darkMode = mode === "dark";

  const [formData, setFormData] = useState({
    destination: "", from: "", days: 3,
    budget: "moderate", interests: ["culture", "food"], travelers: 2,
  });
  const [itinerary, setItinerary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(0);
  const [activeTab, setActiveTab] = useState("planner");

  const handleChange = (f, v) => setFormData((p) => ({ ...p, [f]: v }));
  const toggleInterest = (id) =>
    setFormData((p) => ({
      ...p,
      interests: p.interests.includes(id)
        ? p.interests.filter((i) => i !== id)
        : [...p.interests, id],
    }));

  /* ── handlers ── */
  const handleGenerate = async (e) => {
    e?.preventDefault();
    setLoading(true); setError(null); setItinerary(null);
    try {
      const data = await generateItinerary(formData);
      setItinerary(data.itinerary);
      setExpandedDay(0);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleGetRecommendations = async () => {
    setLoadingRecs(true); setError(null); setRecommendations(null);
    try {
      const data = await getAIRecommendations({
        budget: formData.budget, interests: formData.interests,
        travelers: formData.travelers, days: formData.days,
      });
      setRecommendations(data.recommendations);
    } catch (err) { setError(err.message); }
    finally { setLoadingRecs(false); }
  };

  const getActivityIcon = (t) => ACTIVITY_ICONS[t] || ACTIVITY_ICONS.default;

  /* ═══════════════════════════════════════ JSX ═══════════════════════════════════════ */
  return (
    <Box className={`trip-planner ${darkMode ? "dark" : ""}`}>

      {/* ───────────── HERO ───────────── */}
      <Box className="tp-hero">
        <div className="tp-hero-shape tp-shape-1" />
        <div className="tp-hero-shape tp-shape-2" />
        <div className="tp-hero-shape tp-shape-3" />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Box sx={{ textAlign: "center", py: { xs: 5, md: 7 } }}>
              <Chip icon={<FaMagic />} label="Powered by Gemini AI"
                sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600,
                  backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)",
                  "& .MuiChip-icon": { color: "#fff" } }}
              />
              <Typography variant="h3"
                sx={{ fontWeight: 800, color: "#fff", mb: 1.5, letterSpacing: "-1px",
                  fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                AI Trip Planner
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: ".95rem", md: "1.1rem" },
                maxWidth: 540, mx: "auto", lineHeight: 1.7 }}>
                Create personalized travel itineraries in seconds.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ───────────── TABS ───────────── */}
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Box className="tp-tabs">
            <button className={`tp-tab ${activeTab === "planner" ? "active" : ""}`}
              onClick={() => setActiveTab("planner")}><FaRoute /> <span>Itinerary Planner</span></button>
            <button className={`tp-tab ${activeTab === "recommendations" ? "active" : ""}`}
              onClick={() => setActiveTab("recommendations")}><FaGlobeAmericas /> <span>Get Recommendations</span></button>
          </Box>
        </motion.div>

        {/* ───────────── BODY GRID ───────────── */}
        <Box className="tp-body">

          {/* ═══ FORM PANEL ═══ */}
          <motion.div className="tp-form-section"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            <Paper elevation={0} component="form" onSubmit={handleGenerate}
              sx={{
                borderRadius: "24px",
                p: { xs: 3, md: 4 },
                background: darkMode
                  ? "linear-gradient(160deg, rgba(26,26,48,.97), rgba(20,20,44,.95))"
                  : "linear-gradient(160deg, #ffffff, #f4f5ff)",
                backdropFilter: "blur(20px)",
                border: darkMode
                  ? "1px solid rgba(102,126,234,0.12)"
                  : "1px solid rgba(102,126,234,0.1)",
                boxShadow: darkMode
                  ? "0 8px 48px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)"
                  : "0 8px 48px rgba(102,126,234,0.07), inset 0 1px 0 rgba(255,255,255,.9)",
                transition: "all .4s cubic-bezier(.4,0,.2,1)",
                "&:hover": {
                  boxShadow: darkMode
                    ? "0 14px 56px rgba(0,0,0,.6)"
                    : "0 14px 56px rgba(102,126,234,0.12)",
                },
              }}
            >
              {/* Title */}
              <Typography variant="h6"
                sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1.3,
                  fontSize: "17px", letterSpacing: "-.3px",
                  color: darkMode ? "#e0e0f0" : "#333" }}>
                <Box sx={{ width: 38, height: 38, borderRadius: "12px",
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 15,
                  boxShadow: "0 4px 14px rgba(102,126,234,.35)" }}>
                  <FaMagic />
                </Box>
                Trip Details
              </Typography>

              <Stack spacing={2.5}>
                {/* Destination */}
                <TextField fullWidth label="Destination" required
                  placeholder="e.g., Paris, Tokyo, Bali…"
                  value={formData.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  sx={tfSx(darkMode)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FaMapMarkerAlt /></InputAdornment> }}
                />

                {/* From */}
                <TextField fullWidth label="Traveling From"
                  placeholder="e.g., New York, London…"
                  value={formData.from}
                  onChange={(e) => handleChange("from", e.target.value)}
                  sx={tfSx(darkMode)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FaPlaneDeparture /></InputAdornment> }}
                />

                {/* Days + Travelers */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <TextField type="number" label="Days"
                    value={formData.days}
                    onChange={(e) => handleChange("days", parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: 30 }}
                    sx={tfSx(darkMode)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FaCalendarAlt /></InputAdornment> }}
                  />
                  <TextField type="number" label="Travelers"
                    value={formData.travelers}
                    onChange={(e) => handleChange("travelers", parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: 20 }}
                    sx={tfSx(darkMode)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FaUsers /></InputAdornment> }}
                  />
                </Box>

                {/* ── Budget Level ── */}
                <Box>
                  <Typography sx={{ display: "flex", alignItems: "center", gap: 1,
                    fontSize: "12.5px", fontWeight: 700, mb: 1.2,
                    color: darkMode ? "#9e9eb8" : "#555",
                    textTransform: "uppercase", letterSpacing: ".5px" }}>
                    <FaMoneyBillWave style={{ color: "#667eea", fontSize: 13 }} /> Budget Level
                  </Typography>
                  <Stack spacing={1}>
                    {BUDGET_LEVELS.map((b) => {
                      const sel = formData.budget === b.value;
                      return (
                        <Box key={b.value} onClick={() => handleChange("budget", b.value)}
                          sx={{
                            display: "flex", alignItems: "center", gap: 1.8,
                            p: "14px 18px", borderRadius: "14px", cursor: "pointer",
                            border: sel
                              ? "2px solid #667eea"
                              : darkMode ? "2px solid rgba(255,255,255,.06)" : "2px solid rgba(102,126,234,.12)",
                            background: sel
                              ? (darkMode ? "rgba(102,126,234,.12)" : "rgba(102,126,234,.04)")
                              : (darkMode ? "rgba(255,255,255,.02)" : "rgba(102,126,234,.02)"),
                            boxShadow: sel ? "0 0 0 3px rgba(102,126,234,.08), 0 4px 14px rgba(102,126,234,.12)" : "none",
                            transition: "all .25s cubic-bezier(.4,0,.2,1)",
                            "&:hover": {
                              borderColor: sel ? "#667eea" : "rgba(102,126,234,.3)",
                              transform: "translateX(4px)",
                              background: darkMode ? "rgba(255,255,255,.04)" : "rgba(102,126,234,.05)",
                            },
                          }}>
                          <Box sx={{
                            width: 44, height: 44, borderRadius: "12px",
                            background: sel ? b.gradient : (darkMode ? "rgba(255,255,255,.06)" : "rgba(102,126,234,.06)"),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "22px", flexShrink: 0, transition: "all .3s",
                            boxShadow: sel ? "0 4px 14px rgba(102,126,234,.22)" : "none",
                          }}>
                            {b.icon}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "14px",
                              color: darkMode ? "#eee" : "#333", lineHeight: 1.3 }}>{b.label}</Typography>
                            <Typography sx={{ fontSize: "11.5px",
                              color: darkMode ? "#8888a8" : "#888", lineHeight: 1.3, mt: .2 }}>{b.desc}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>

                {/* ── Interests ── */}
                <Box>
                  <Typography sx={{ display: "flex", alignItems: "center", gap: 1,
                    fontSize: "12.5px", fontWeight: 700, mb: 1.2,
                    color: darkMode ? "#9e9eb8" : "#555",
                    textTransform: "uppercase", letterSpacing: ".5px" }}>
                    <FaHeart style={{ color: "#f5576c", fontSize: 13 }} /> Interests
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {INTEREST_OPTIONS.map((opt) => {
                      const sel = formData.interests.includes(opt.id);
                      return (
                        <Chip key={opt.id} icon={opt.icon} label={opt.label}
                          onClick={() => toggleInterest(opt.id)}
                          sx={{
                            fontFamily: "'Poppins', sans-serif", fontWeight: sel ? 700 : 500,
                            fontSize: "12.5px", height: 38, borderRadius: "24px", cursor: "pointer",
                            border: sel ? `2px solid ${opt.color}` : (darkMode ? "2px solid rgba(255,255,255,.08)" : "2px solid rgba(0,0,0,.06)"),
                            background: sel ? `${opt.color}14` : (darkMode ? "rgba(255,255,255,.03)" : "rgba(102,126,234,.02)"),
                            color: sel ? opt.color : (darkMode ? "#bbb" : "#555"),
                            transition: "all .25s cubic-bezier(.4,0,.2,1)",
                            "& .MuiChip-icon": { color: sel ? opt.color : (darkMode ? "#888" : "#999"), fontSize: 14 },
                            "&:hover": {
                              borderColor: opt.color, transform: "translateY(-2px)",
                              boxShadow: `0 4px 12px ${opt.color}20`, background: `${opt.color}0a`,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Stack>

              {/* ── CTA Button ── */}
              {activeTab === "planner" ? (
                <Box component="button" type="submit"
                  disabled={loading || !formData.destination}
                  sx={{
                    width: "100%", mt: 3, p: "16px", border: "none", borderRadius: "16px",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Poppins',sans-serif",
                    cursor: (loading || !formData.destination) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    opacity: (loading || !formData.destination) ? .55 : 1,
                    transition: "all .3s cubic-bezier(.4,0,.2,1)",
                    boxShadow: "0 4px 22px rgba(102,126,234,.35)",
                    "&:hover:not(:disabled)": { transform: "translateY(-3px)",
                      boxShadow: "0 10px 34px rgba(102,126,234,.45)" },
                  }}>
                  {loading ? <><FaSpinner className="spin" /> Generating...</> : <><FaMagic /> Generate Itinerary</>}
                </Box>
              ) : (
                <Box component="button" type="button"
                  disabled={loadingRecs} onClick={handleGetRecommendations}
                  sx={{
                    width: "100%", mt: 3, p: "16px", border: "none", borderRadius: "16px",
                    background: "linear-gradient(135deg,#f093fb,#f5576c)",
                    color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Poppins',sans-serif",
                    cursor: loadingRecs ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    opacity: loadingRecs ? .55 : 1,
                    transition: "all .3s cubic-bezier(.4,0,.2,1)",
                    boxShadow: "0 4px 22px rgba(240,147,251,.32)",
                    "&:hover:not(:disabled)": { transform: "translateY(-3px)",
                      boxShadow: "0 10px 34px rgba(240,147,251,.42)" },
                  }}>
                  {loadingRecs ? <><FaSpinner className="spin" /> Finding...</> : <><FaLightbulb /> Get AI Recommendations</>}
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* ═══ RESULTS PANEL ═══ */}
          <div className="tp-results-section">
            <AnimatePresence mode="wait">

              {/* Error */}
              {error && (
                <motion.div key="error" initial={{ opacity: 0, scale: .95 }}
                  animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}
                  className="tp-error">
                  <p>{error}</p>
                  <button onClick={() => setError(null)}>Dismiss</button>
                </motion.div>
              )}

              {/* Loading */}
              {(loading || loadingRecs) && (
                <motion.div key="loading" initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tp-loading">
                  <div className="tp-loading-orb"><FaMagic className="spin" /></div>
                  <h3>{loading ? "Crafting your perfect itinerary…" : "Finding the best destinations…"}</h3>
                  <p>Our AI is analyzing thousands of options</p>
                  <div className="tp-loading-bar"><div className="tp-loading-progress" /></div>
                </motion.div>
              )}

              {/* ── Itinerary results ── */}
              {itinerary && activeTab === "planner" && !loading && (
                <motion.div key="itinerary" variants={containerVariants}
                  initial="hidden" animate="visible" className="tp-itinerary">

                  <motion.div variants={itemVariants} className="tp-itinerary-header">
                    <Chip icon={<FaStar />} label="AI Generated" size="small"
                      sx={{ mb: 1, bgcolor: "rgba(102,126,234,.1)", color: "#667eea",
                        fontWeight: 600, "& .MuiChip-icon": { color: "#667eea" } }} />
                    <h2>{itinerary.title || `Trip to ${formData.destination}`}</h2>
                    {itinerary.summary && <p>{itinerary.summary}</p>}
                    <button className="tp-redo-btn" onClick={handleGenerate}><FaRedo /> Regenerate</button>
                  </motion.div>

                  {itinerary.estimatedBudget && (
                    <motion.div variants={itemVariants} className="tp-budget-summary">
                      <h3><FaMoneyBillWave /> Estimated Budget</h3>
                      <div className="budget-grid">
                        {Object.entries(itinerary.estimatedBudget).map(([k, v]) => (
                          <div key={k} className="budget-item">
                            <span className="budget-label">{k}</span>
                            <span className="budget-value">{v}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {itinerary.days?.map((day, di) => (
                    <motion.div key={di} variants={itemVariants}
                      className={`tp-day-card ${expandedDay === di ? "expanded" : ""}`}>
                      <button className="tp-day-header"
                        onClick={() => setExpandedDay(expandedDay === di ? null : di)}>
                        <div className="day-title">
                          <span className="day-number">Day {di + 1}</span>
                          <span className="day-theme">{day.theme || day.title || ""}</span>
                        </div>
                        <span className="day-chevron">
                          {expandedDay === di ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      </button>
                      <AnimatePresence>
                        {expandedDay === di && (
                          <motion.div initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: .3 }}
                            style={{ overflow: "hidden" }}>
                            <div className="tp-day-content">
                              {day.activities?.map((act, ai) => (
                                <div key={ai} className="tp-activity">
                                  <div className="activity-timeline">
                                    <div className="activity-icon">{getActivityIcon(act.type)}</div>
                                    {ai < day.activities.length - 1 && <div className="timeline-line" />}
                                  </div>
                                  <div className="activity-content">
                                    <div className="activity-time"><FaClock /> {act.time || "Flexible"}</div>
                                    <h4>{act.name || act.title}</h4>
                                    <p>{act.description}</p>
                                    {act.cost && <span className="activity-cost"><FaMoneyBillWave /> {act.cost}</span>}
                                    {act.tip && <div className="activity-tip"><FaLightbulb /> {act.tip}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {itinerary.tips?.length > 0 && (
                    <motion.div variants={itemVariants} className="tp-tips">
                      <h3><FaLightbulb /> Pro Tips</h3>
                      <ul>{itinerary.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── Recommendations ── */}
              {recommendations && activeTab === "recommendations" && !loadingRecs && (
                <motion.div key="recs" variants={containerVariants}
                  initial="hidden" animate="visible" className="tp-recommendations">
                  <motion.div variants={itemVariants}>
                    <h2><FaStar /> AI-Recommended Destinations</h2>
                  </motion.div>
                  <div className="rec-grid">
                    {(Array.isArray(recommendations) ? recommendations : []).map((rec, i) => (
                      <motion.div key={i} variants={itemVariants} className="rec-card">
                        <div className="rec-rank">#{i + 1}</div>
                        <h3>{rec.destination || rec.name}</h3>
                        <p className="rec-description">{rec.description || rec.reason}</p>
                        {rec.bestTime && <div className="rec-meta"><FaCalendarAlt /> Best time: {rec.bestTime}</div>}
                        {rec.estimatedCost && <div className="rec-meta"><FaMoneyBillWave /> ~{rec.estimatedCost}</div>}
                        {rec.highlights && (
                          <div className="rec-highlights">
                            {(Array.isArray(rec.highlights) ? rec.highlights : []).map((h, j) =>
                              <span key={j} className="rec-tag">{h}</span>)}
                          </div>
                        )}
                        <button className="rec-plan-btn"
                          onClick={() => { handleChange("destination", rec.destination || rec.name); setActiveTab("planner"); }}>
                          <FaMagic /> Plan This Trip
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {!loading && !loadingRecs && !itinerary && !recommendations && !error && (
                <motion.div key="empty" initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}
                  className="tp-empty">
                  <div className="tp-empty-visual">
                    <div className="tp-empty-globe"><FaGlobeAmericas /></div>
                    <div className="tp-empty-pin"><FaMapMarkerAlt /></div>
                  </div>
                  <h3>Your AI-Generated Trip Awaits</h3>
                  <p>Fill in your travel preferences and let our AI create a personalized itinerary just for you.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Box>
      </Container>
    </Box>
  );
};

export default TripPlanner;
