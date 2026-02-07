import React, { useState } from "react";
import { generateItinerary, getAIRecommendations } from "../utils/api";
import { useThemeMode } from "../context/ThemeContext";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaHeart,
  FaPlaneDeparture,
  FaMagic,
  FaClock,
  FaUtensils,
  FaLandmark,
  FaHiking,
  FaShoppingBag,
  FaCamera,
  FaBed,
  FaBus,
  FaStar,
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";

const INTEREST_OPTIONS = [
  { id: "culture", label: "Culture & History", icon: <FaLandmark /> },
  { id: "food", label: "Food & Dining", icon: <FaUtensils /> },
  { id: "adventure", label: "Adventure", icon: <FaHiking /> },
  { id: "shopping", label: "Shopping", icon: <FaShoppingBag /> },
  { id: "photography", label: "Photography", icon: <FaCamera /> },
  { id: "relaxation", label: "Relaxation", icon: <FaBed /> },
];

const BUDGET_LEVELS = [
  { value: "budget", label: "Budget", desc: "Hostels, street food, public transport" },
  { value: "moderate", label: "Moderate", desc: "Mid-range hotels, restaurants" },
  { value: "luxury", label: "Luxury", desc: "5-star hotels, fine dining, private tours" },
];

const ACTIVITY_ICONS = {
  sightseeing: <FaCamera />,
  food: <FaUtensils />,
  culture: <FaLandmark />,
  adventure: <FaHiking />,
  shopping: <FaShoppingBag />,
  transport: <FaBus />,
  rest: <FaBed />,
  default: <FaMapMarkerAlt />,
};

const TripPlanner = ({ onNavigate }) => {
  const { mode } = useThemeMode();
  const darkMode = mode === 'dark';
  const [formData, setFormData] = useState({
    destination: "",
    from: "",
    days: 3,
    budget: "moderate",
    interests: [],
    travelers: 1,
  });
  const [itinerary, setItinerary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [activeTab, setActiveTab] = useState("planner"); // planner | recommendations

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (id) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.destination) return;

    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const data = await generateItinerary(formData);
      setItinerary(data.itinerary);
      setExpandedDay(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoadingRecs(true);
    setError(null);
    try {
      const prefs = {
        budget: formData.budget,
        interests: formData.interests,
        travelers: formData.travelers,
        days: formData.days,
      };
      const data = await getAIRecommendations(prefs);
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRecs(false);
    }
  };

  const getActivityIcon = (type) => {
    return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default;
  };

  return (
    <div className={`trip-planner ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="tp-header">
        <div className="tp-header-content">
          <h1>
            <FaMagic className="tp-header-icon" />
            AI Trip Planner
          </h1>
          <p>
            Let Gemini Pro AI create your perfect travel itinerary. Just tell us
            where you want to go!
          </p>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="tp-tabs">
        <button
          className={`tp-tab ${activeTab === "planner" ? "active" : ""}`}
          onClick={() => setActiveTab("planner")}
        >
          <FaCalendarAlt /> Itinerary Planner
        </button>
        <button
          className={`tp-tab ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          <FaLightbulb /> Get Recommendations
        </button>
      </div>

      <div className="tp-body">
        {/* Form */}
        <div className="tp-form-section">
          <form onSubmit={handleGenerate} className="tp-form">
            <div className="tp-form-group">
              <label>
                <FaMapMarkerAlt /> Destination
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                placeholder="e.g., Paris, Tokyo, Bali..."
                required
              />
            </div>

            <div className="tp-form-group">
              <label>
                <FaPlaneDeparture /> Traveling From
              </label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => handleChange("from", e.target.value)}
                placeholder="e.g., New York, London..."
              />
            </div>

            <div className="tp-form-row">
              <div className="tp-form-group">
                <label>
                  <FaCalendarAlt /> Days
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.days}
                  onChange={(e) =>
                    handleChange("days", parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="tp-form-group">
                <label>
                  <FaUsers /> Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.travelers}
                  onChange={(e) =>
                    handleChange("travelers", parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>

            <div className="tp-form-group">
              <label>
                <FaMoneyBillWave /> Budget Level
              </label>
              <div className="budget-options">
                {BUDGET_LEVELS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    className={`budget-option ${
                      formData.budget === b.value ? "selected" : ""
                    }`}
                    onClick={() => handleChange("budget", b.value)}
                  >
                    <strong>{b.label}</strong>
                    <span>{b.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tp-form-group">
              <label>
                <FaHeart /> Interests
              </label>
              <div className="interest-options">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`interest-chip ${
                      formData.interests.includes(opt.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleInterest(opt.id)}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "planner" ? (
              <button
                type="submit"
                className="tp-generate-btn"
                disabled={loading || !formData.destination}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spin" /> Generating your itinerary...
                  </>
                ) : (
                  <>
                    <FaMagic /> Generate Itinerary
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="tp-generate-btn recommend"
                disabled={loadingRecs}
                onClick={handleGetRecommendations}
              >
                {loadingRecs ? (
                  <>
                    <FaSpinner className="spin" /> Finding destinations...
                  </>
                ) : (
                  <>
                    <FaLightbulb /> Get AI Recommendations
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        <div className="tp-results-section">
          {error && (
            <div className="tp-error">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {/* Loading Skeleton */}
          {(loading || loadingRecs) && (
            <div className="tp-loading">
              <div className="tp-loading-icon">
                <FaMagic className="spin" />
              </div>
              <h3>
                {loading
                  ? "Crafting your perfect itinerary..."
                  : "Finding the best destinations for you..."}
              </h3>
              <p>This may take a few seconds</p>
              <div className="tp-loading-bar">
                <div className="tp-loading-progress" />
              </div>
            </div>
          )}

          {/* Itinerary Results */}
          {itinerary && activeTab === "planner" && !loading && (
            <div className="tp-itinerary">
              <div className="tp-itinerary-header">
                <h2>{itinerary.title || `Trip to ${formData.destination}`}</h2>
                {itinerary.summary && <p>{itinerary.summary}</p>}
                <button className="tp-redo-btn" onClick={handleGenerate}>
                  <FaRedo /> Regenerate
                </button>
              </div>

              {/* Budget Summary */}
              {itinerary.estimatedBudget && (
                <div className="tp-budget-summary">
                  <h3>
                    <FaMoneyBillWave /> Estimated Budget
                  </h3>
                  <div className="budget-grid">
                    {Object.entries(itinerary.estimatedBudget).map(
                      ([key, val]) => (
                        <div key={key} className="budget-item">
                          <span className="budget-label">{key}</span>
                          <span className="budget-value">{val}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Day Cards */}
              {itinerary.days &&
                itinerary.days.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`tp-day-card ${
                      expandedDay === dayIdx ? "expanded" : ""
                    }`}
                  >
                    <button
                      className="tp-day-header"
                      onClick={() =>
                        setExpandedDay(expandedDay === dayIdx ? null : dayIdx)
                      }
                    >
                      <div className="day-title">
                        <span className="day-number">Day {dayIdx + 1}</span>
                        <span className="day-theme">
                          {day.theme || day.title || ""}
                        </span>
                      </div>
                      {expandedDay === dayIdx ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>

                    {expandedDay === dayIdx && (
                      <div className="tp-day-content">
                        {day.activities &&
                          day.activities.map((activity, actIdx) => (
                            <div key={actIdx} className="tp-activity">
                              <div className="activity-timeline">
                                <div className="activity-icon">
                                  {getActivityIcon(activity.type)}
                                </div>
                                {actIdx < day.activities.length - 1 && (
                                  <div className="timeline-line" />
                                )}
                              </div>
                              <div className="activity-content">
                                <div className="activity-time">
                                  <FaClock /> {activity.time || "Flexible"}
                                </div>
                                <h4>{activity.name || activity.title}</h4>
                                <p>{activity.description}</p>
                                {activity.cost && (
                                  <span className="activity-cost">
                                    <FaMoneyBillWave /> {activity.cost}
                                  </span>
                                )}
                                {activity.tip && (
                                  <div className="activity-tip">
                                    <FaLightbulb /> {activity.tip}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* Tips */}
              {itinerary.tips && itinerary.tips.length > 0 && (
                <div className="tp-tips">
                  <h3>
                    <FaLightbulb /> Pro Tips
                  </h3>
                  <ul>
                    {itinerary.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {recommendations &&
            activeTab === "recommendations" &&
            !loadingRecs && (
              <div className="tp-recommendations">
                <h2>
                  <FaStar /> AI-Recommended Destinations
                </h2>
                <div className="rec-grid">
                  {(Array.isArray(recommendations)
                    ? recommendations
                    : []
                  ).map((rec, i) => (
                    <div key={i} className="rec-card">
                      <div className="rec-rank">#{i + 1}</div>
                      <h3>{rec.destination || rec.name}</h3>
                      <p className="rec-description">{rec.description || rec.reason}</p>
                      {rec.bestTime && (
                        <div className="rec-meta">
                          <FaCalendarAlt /> Best time: {rec.bestTime}
                        </div>
                      )}
                      {rec.estimatedCost && (
                        <div className="rec-meta">
                          <FaMoneyBillWave /> ~{rec.estimatedCost}
                        </div>
                      )}
                      {rec.highlights && (
                        <div className="rec-highlights">
                          {(Array.isArray(rec.highlights)
                            ? rec.highlights
                            : []
                          ).map((h, j) => (
                            <span key={j} className="rec-tag">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        className="rec-plan-btn"
                        onClick={() => {
                          handleChange(
                            "destination",
                            rec.destination || rec.name
                          );
                          setActiveTab("planner");
                        }}
                      >
                        <FaMagic /> Plan This Trip
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Empty state */}
          {!loading &&
            !loadingRecs &&
            !itinerary &&
            !recommendations &&
            !error && (
              <div className="tp-empty">
                <FaMagic className="tp-empty-icon" />
                <h3>Your AI-Generated Trip Awaits</h3>
                <p>
                  Fill in your travel preferences and let our AI create a
                  personalized itinerary just for you.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
