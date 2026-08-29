
import { useEffect, useMemo, useState } from "react";
import "./App.css";

/*
  TRACKX — KMRL Train Induction Dashboard

  PUBLIC KMRL FACTS:
  - 25 metro trains
  - Train names are based on KMRL's official project information
  - Kochi Metro uses 3-coach trainsets
  - Train capacity: 975 passengers (crush load)
  - Design speed: 90 km/h

  OPERATIONAL DEMO DATA:
  Fitness, mileage, maintenance and branding fields below are
  simulated operational records for demonstrating the decision engine.
  They are NOT claimed to be live KMRL internal data.
*/

const officialTrains = [
  "KRISHNA",
  "TAPTI",
  "NILA",
  "SARAYU",
  "ARUTH",
  "VAIGAI",
  "JHANAVI",
  "DHWANIL",
  "BHAVANI",
  "PADMA",
  "MANDAKINI",
  "YAMUNA",
  "PERIYAR",
  "KABANI",
  "VAAYU",
  "KAVERI",
  "SHIRIYA",
  "PAMPA",
  "NARMADA",
  "MAHE",
  "MAARUT",
  "SABARMATHI",
  "GODHAVARI",
  "GANGA",
  "PAVAN",
];

const seedData = officialTrains.map((name, index) => {
  const mileage = 28000 + ((index * 1377) % 29000);

  const fitness =
    index === 7 || index === 18
      ? "Review"
      : "Valid";

  const maintenance =
    index === 5 || index === 14 || index === 21
      ? "Due"
      : index === 9 || index === 17
      ? "Scheduled"
      : "Clear";

  const branding =
    index % 5 === 0
      ? "High"
      : index % 3 === 0
      ? "Medium"
      : "Low";

  return {
    id: `KMRL-${String(index + 1).padStart(2, "0")}`,
    name,
    fitness,
    mileage,
    branding,
    maintenance,
  };
});

/* -------------------------------------------
   DECISION ENGINE
-------------------------------------------- */

function calculateTrainDecision(train) {
  let score = 100;
  const reasons = [];

  if (train.fitness !== "Valid") {
    score -= 50;
    reasons.push("Fitness certificate requires review");
  } else {
    reasons.push("Fitness certificate valid");
  }

  if (train.maintenance === "Due") {
    score -= 45;
    reasons.push("Maintenance constraint detected");
  } else if (train.maintenance === "Scheduled") {
    score -= 20;
    reasons.push("Scheduled maintenance approaching");
  } else {
    reasons.push("No maintenance constraint");
  }

  if (train.mileage > 50000) {
    score -= 20;
    reasons.push("Higher accumulated mileage");
  } else if (train.mileage < 35000) {
    score += 8;
    reasons.push("Lower accumulated mileage");
  } else {
    reasons.push("Mileage within balanced range");
  }

  if (train.branding === "High") {
    score += 4;
    reasons.push("High branding priority");
  }

  let decision = "INDUCT";

  if (score < 60) {
    decision = "HOLD";
  } else if (score < 80) {
    decision = "STANDBY";
  }

  return {
    ...train,
    score: Math.max(0, Math.min(100, score)),
    decision,
    reasons,
  };
}

/* -------------------------------------------
   APP
-------------------------------------------- */

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [trains, setTrains] = useState(seedData);
  const [lastUpdated, setLastUpdated] = useState("Demo data loaded");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedTrain, setSelectedTrain] = useState(null);

  /*
    Attempts to load the serverless backend.
    If running locally without the API, the dashboard gracefully
    falls back to the embedded demonstration dataset.
  */
  useEffect(() => {
    fetch("/api/fleet")
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.trains) && data.trains.length) {
          setTrains(data.trains);
          setLastUpdated("Backend data synced");
        }
      })
      .catch(() => {
        setLastUpdated("Demo operational dataset");
      });
  }, []);

  const evaluatedTrains = useMemo(
    () => trains.map(calculateTrainDecision),
    [trains]
  );

  const stats = useMemo(() => {
    const ready = evaluatedTrains.filter(
      (t) => t.decision === "INDUCT"
    ).length;

    const standby = evaluatedTrains.filter(
      (t) => t.decision === "STANDBY"
    ).length;

    const maintenance = evaluatedTrains.filter(
      (t) => t.maintenance === "Due"
    ).length;

    const fitnessValid = evaluatedTrains.filter(
      (t) => t.fitness === "Valid"
    ).length;

    const readiness = Math.round(
      (ready / evaluatedTrains.length) * 100
    );

    const averageMileage =
      evaluatedTrains.reduce((sum, t) => sum + t.mileage, 0) /
      evaluatedTrains.length;

    return {
      ready,
      standby,
      maintenance,
      fitnessValid,
      readiness,
      averageMileage: Math.round(averageMileage),
    };
  }, [evaluatedTrains]);

  const filteredTrains = useMemo(() => {
    return evaluatedTrains.filter((train) => {
      const matchesSearch =
        train.name.toLowerCase().includes(search.toLowerCase()) ||
        train.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" || train.decision === filter;

      return matchesSearch && matchesFilter;
    });
  }, [evaluatedTrains, search, filter]);

  const recommendedTrains = useMemo(() => {
    return [...evaluatedTrains]
      .filter((train) => train.decision === "INDUCT")
      .sort((a, b) => b.score - a.score);
  }, [evaluatedTrains]);

  const alerts = useMemo(() => {
    return evaluatedTrains.filter(
      (train) =>
        train.decision !== "INDUCT" ||
        train.fitness !== "Valid" ||
        train.maintenance !== "Clear"
    );
  }, [evaluatedTrains]);

  function refreshData() {
    setLastUpdated("Refreshing...");

    fetch("/api/fleet")
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.trains)) {
          setTrains(data.trains);
        }
        setLastUpdated(
          `Synced ${new Date().toLocaleTimeString()}`
        );
      })
      .catch(() => {
        setLastUpdated(
          `Demo data refreshed ${new Date().toLocaleTimeString()}`
        );
      });
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo-area">
          <div className="logo-box">K</div>

          <div>
            <h2>TRACKX</h2>
            <p>KMRL SMART OPERATIONS</p>
          </div>
        </div>

        <p className="nav-title">MAIN MENU</p>

        <nav>

          <button
            className={
              activePage === "Dashboard" ? "nav-active" : ""
            }
            onClick={() => setActivePage("Dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "Fleet" ? "nav-active" : ""
            }
            onClick={() => setActivePage("Fleet")}
          >
            <span>🚇</span>
            Fleet
          </button>

          <button
            className={
              activePage === "Schedule" ? "nav-active" : ""
            }
            onClick={() => setActivePage("Schedule")}
          >
            <span>◷</span>
            Schedule
          </button>

          <button
            className={
              activePage === "Alerts" ? "nav-active" : ""
            }
            onClick={() => setActivePage("Alerts")}
          >
            <span>⚠</span>
            Alerts
            {alerts.length > 0 && (
              <span className="notification">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            className={
              activePage === "Analytics" ? "nav-active" : ""
            }
            onClick={() => setActivePage("Analytics")}
          >
            <span>◈</span>
            Analytics
          </button>

        </nav>

        <p className="nav-title second-title">SYSTEM</p>

        <nav>
          <button
            className={
              activePage === "Settings" ? "nav-active" : ""
            }
            onClick={() => setActivePage("Settings")}
          >
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">

          <div className="online-dot"></div>

          <div>
            <strong>System Online</strong>
            <p>Decision engine operational</p>
          </div>

        </div>

        <div className="sidebar-train-area">

          <div className="rail-line"></div>

          <div className="sidebar-train">

            <div className="train-front">
              <div className="front-window"></div>
              <div className="headlight"></div>
            </div>

            <div className="train-coach">
              <span></span>
              <span></span>
            </div>

            <div className="train-coach">
              <span></span>
              <span></span>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        <header className="top">

          <div>

            <p className="small-label">
              KOCHI METRO RAIL LIMITED
            </p>

            <h1>
              Train Induction <span>Overview.</span>
            </h1>

            <p className="subtitle">
              Data-driven fleet readiness and induction decision support
            </p>

          </div>

          <div className="profile-area">

            <div className="sync">
              <span>●</span> {lastUpdated}
            </div>

            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀" : "☾"}
            </button>

            <button
              className="theme-toggle"
              onClick={refreshData}
              title="Refresh fleet data"
            >
              ↻
            </button>

            <div className="profile">

              <div className="avatar">
                OP
              </div>

              <div>
                <strong>Operations</strong>
                <small>Control Room</small>
              </div>

              <span className="arrow">⌄</span>

            </div>

          </div>

        </header>

        {/* DASHBOARD */}

        {activePage === "Dashboard" && (
          <>

            <section className="quick-grid">

              <div className="quick-card green-card">

                <div className="quick-icon">✓</div>

                <div>
                  <p>READY FOR SERVICE</p>
                  <h2>{stats.ready}</h2>
                  <span>of {evaluatedTrains.length} trainsets</span>
                </div>

                <small className="positive">
                  AI ranked
                </small>

              </div>

              <div className="quick-card yellow-card">

                <div className="quick-icon">◷</div>

                <div>
                  <p>STANDBY</p>
                  <h2>{stats.standby}</h2>
                  <span>trainsets</span>
                </div>

                <small>
                  {Math.round(
                    (stats.standby / evaluatedTrains.length) * 100
                  )}%
                </small>

              </div>

              <div className="quick-card red-card">

                <div className="quick-icon">⚠</div>

                <div>
                  <p>MAINTENANCE</p>
                  <h2>{stats.maintenance}</h2>
                  <span>constraints</span>
                </div>

                <small>
                  action required
                </small>

              </div>

              <div className="quick-card blue-card">

                <div className="quick-icon">↗</div>

                <div>
                  <p>READINESS</p>
                  <h2>{stats.readiness}%</h2>
                  <span>fleet readiness</span>
                </div>

                <small className="positive">
                  calculated
                </small>

              </div>

            </section>

            <section className="dashboard-grid">

              <div className="card fleet-card">

                <div className="card-header">

                  <div>
                    <p className="label">
                      FLEET STATUS
                    </p>

                    <h2>
                      Today's Fleet Readiness
                    </h2>
                  </div>

                  <button>
                    {evaluatedTrains.length} Trainsets
                  </button>

                </div>

                <div className="fleet-content">

                  <div
                    className="donut"
                    style={{
                      background: `conic-gradient(
                        #58a97d 0deg ${stats.readiness * 3.6}deg,
                        #d5b74e ${stats.readiness * 3.6}deg 300deg,
                        #d66e69 300deg 360deg
                      )`,
                    }}
                  >

                    <div className="donut-hole">

                      <strong>
                        {stats.readiness}%
                      </strong>

                      <span>
                        READY
                      </span>

                    </div>

                  </div>

                  <div className="legend">

                    <div>
                      <span className="dot green-dot"></span>
                      <span>Ready</span>
                      <strong>{stats.ready}</strong>
                    </div>

                    <div>
                      <span className="dot yellow-dot"></span>
                      <span>Standby</span>
                      <strong>{stats.standby}</strong>
                    </div>

                    <div>
                      <span className="dot red-dot"></span>
                      <span>Maintenance</span>
                      <strong>{stats.maintenance}</strong>
                    </div>

                  </div>

                </div>

              </div>

              {/* AI CARD */}

              <div className="card ai-card">

                <div className="card-header">

                  <div>
                    <p className="label">
                      AI RECOMMENDATION
                    </p>

                    <h2>
                      Induction Planning
                    </h2>
                  </div>

                  <span className="ai-pill">
                    AI OPTIMIZED
                  </span>

                </div>

                <div className="ai-main">

                  <div className="ai-number">

                    <strong>
                      {recommendedTrains.length}
                    </strong>

                    <span>
                      trains
                      <br />
                      recommended
                    </span>

                  </div>

                  <div className="ai-reasons">

                    <p>
                      ✓ Fitness status evaluated
                    </p>

                    <p>
                      ✓ Mileage balance evaluated
                    </p>

                    <p>
                      ✓ Maintenance constraints checked
                    </p>

                    <p>
                      ✓ Priority score generated
                    </p>

                  </div>

                </div>

                <button
                  className="dark-button"
                  onClick={() => setActivePage("Schedule")}
                >
                  View AI Recommendation →
                </button>

              </div>

            </section>

            {/* DATA QUALITY / SOURCE */}

            <section className="mini-grid">

              <div className="mini-card">

                <div className="mini-icon">✓</div>

                <div>
                  <p>FITNESS</p>
                  <h3>
                    {stats.fitnessValid} / {evaluatedTrains.length}
                  </h3>
                  <small>
                    demo certificates valid
                  </small>
                </div>

              </div>

              <div className="mini-card">

                <div className="mini-icon">▣</div>

                <div>
                  <p>MAINTENANCE</p>
                  <h3>
                    {evaluatedTrains.length - stats.maintenance}
                  </h3>
                  <small>
                    clear for planning
                  </small>
                </div>

              </div>

              <div className="mini-card">

                <div className="mini-icon">◉</div>

                <div>
                  <p>KMRL FLEET</p>
                  <h3>25</h3>
                  <small>
                    official train identities
                  </small>
                </div>

              </div>

              <div className="mini-card">

                <div className="mini-icon">↗</div>

                <div>
                  <p>AVG MILEAGE</p>
                  <h3>
                    {(stats.averageMileage / 1000).toFixed(1)}k
                  </h3>
                  <small>
                    demo operational metric
                  </small>
                </div>

              </div>

            </section>

            {/* TRAIN LIST */}

            <section className="card train-card">

              <div className="card-header">

                <div>
                  <p className="label">
                    INDUCTION PLAN
                  </p>

                  <h2>
                    Trainset Decisions
                  </h2>
                </div>

                <button
                  className="outline-button"
                  onClick={() => setActivePage("Fleet")}
                >
                  View Fleet →
                </button>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  margin: "18px 0 0",
                  flexWrap: "wrap",
                }}
              >

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search train or name..."
                  style={{
                    padding: "10px 13px",
                    borderRadius: "9px",
                    border: "1px solid rgba(80,100,95,.25)",
                    background: "rgba(255,255,255,.6)",
                    outline: "none",
                  }}
                />

                {["ALL", "INDUCT", "STANDBY", "HOLD"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => setFilter(option)}
                      style={{
                        padding: "9px 12px",
                        borderRadius: "9px",
                        border: "1px solid rgba(80,100,95,.25)",
                        background:
                          filter === option
                            ? "#214d49"
                            : "rgba(255,255,255,.5)",
                        color:
                          filter === option
                            ? "white"
                            : "#304843",
                        fontSize: "10px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {option}
                    </button>
                  )
                )}

              </div>

              <div className="train-list">

                <div className="train-heading">
                  <span>TRAINSET</span>
                  <span>FITNESS</span>
                  <span>MILEAGE</span>
                  <span>BRANDING</span>
                  <span>MAINTENANCE</span>
                  <span>DECISION</span>
                  <span></span>
                </div>

                {filteredTrains.slice(0, 10).map((train) => (

                  <div
                    className="train-row"
                    key={train.id}
                    onClick={() => setSelectedTrain(train)}
                    style={{ cursor: "pointer" }}
                  >

                    <strong>
                      {train.id}
                      <br />
                      <small>{train.name}</small>
                    </strong>

                    <span
                      className={
                        train.fitness === "Valid"
                          ? "text-green"
                          : "text-red"
                      }
                    >
                      {train.fitness === "Valid"
                        ? "✓ Valid"
                        : "⚠ Review"}
                    </span>

                    <span>
                      {train.mileage.toLocaleString()} km
                    </span>

                    <span>
                      {train.branding}
                    </span>

                    <span
                      className={
                        train.maintenance === "Clear"
                          ? "text-green"
                          : "text-red"
                      }
                    >
                      {train.maintenance}
                    </span>

                    <span
                      className={
                        train.decision === "INDUCT"
                          ? "decision decision-green"
                          : train.decision === "STANDBY"
                          ? "decision decision-yellow"
                          : "decision"
                      }
                    >
                      {train.decision}
                    </span>

                    <span>›</span>

                  </div>

                ))}

              </div>

              <p
                style={{
                  marginTop: "14px",
                  fontSize: "9px",
                  color: "#5b6b67",
                }}
              >
                * Train identities are based on publicly available KMRL
                information. Operational readiness, mileage, maintenance
                and branding values are simulated demonstration data.
              </p>

            </section>

          </>
        )}

        {/* FLEET */}

        {activePage === "Fleet" && (

          <section>

            <div style={{ marginTop: "28px" }}>
              <p className="label">FLEET MANAGEMENT</p>

              <h2
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "30px",
                }}
              >
                KMRL Fleet
              </h2>

              <p>
                {evaluatedTrains.length} trainsets evaluated by the
                induction decision engine.
              </p>
            </div>

            <section className="card train-card">

              <div className="train-list">

                {evaluatedTrains.map((train) => (

                  <div
                    className="train-row"
                    key={train.id}
                    onClick={() => setSelectedTrain(train)}
                    style={{ cursor: "pointer" }}
                  >

                    <strong>
                      {train.name}
                      <br />
                      <small>{train.id}</small>
                    </strong>

                    <span>
                      Score: <b>{train.score}</b>
                    </span>

                    <span>
                      {(train.mileage / 1000).toFixed(1)}k km
                    </span>

                    <span>
                      {train.branding}
                    </span>

                    <span>
                      {train.maintenance}
                    </span>

                    <span
                      className={
                        train.decision === "INDUCT"
                          ? "decision decision-green"
                          : "decision decision-yellow"
                      }
                    >
                      {train.decision}
                    </span>

                    <span>›</span>

                  </div>

                ))}

              </div>

            </section>

          </section>

        )}

        {/* SCHEDULE */}

        {activePage === "Schedule" && (

          <section>

            <div style={{ marginTop: "28px" }}>

              <p className="label">
                AI DECISION ENGINE
              </p>

              <h2
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "30px",
                }}
              >
                Recommended Induction
              </h2>

              <p>
                Ranked using fitness, maintenance, mileage and
                operational priority.
              </p>

            </div>

            <section className="card ai-card">

              {recommendedTrains.map((train, index) => (

                <div
                  key={train.id}
                  style={{
                    padding: "16px 0",
                    borderBottom:
                      "1px solid rgba(80,80,80,.15)",
                    display: "grid",
                    gridTemplateColumns:
                      "50px 1fr 100px 100px",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >

                  <strong>
                    #{index + 1}
                  </strong>

                  <div>
                    <strong>{train.name}</strong>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "10px",
                      }}
                    >
                      {train.reasons.slice(0, 2).join(" • ")}
                    </p>
                  </div>

                  <strong>
                    Score {train.score}
                  </strong>

                  <span className="decision decision-green">
                    INDUCT
                  </span>

                </div>

              ))}

            </section>

          </section>

        )}

        {/* ALERTS */}

        {activePage === "Alerts" && (

          <section>

            <div style={{ marginTop: "28px" }}>

              <p className="label">
                OPERATIONAL ALERTS
              </p>

              <h2
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "30px",
                }}
              >
                Attention Required
              </h2>

            </div>

            <section className="card train-card">

              {alerts.length === 0 && (
                <h3>No active alerts.</h3>
              )}

              {alerts.map((train) => (

                <div
                  key={train.id}
                  style={{
                    padding: "18px",
                    marginBottom: "10px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,.45)",
                  }}
                >

                  <strong>
                    ⚠ {train.name} — {train.id}
                  </strong>

                  <p>
                    {train.reasons.join(" • ")}
                  </p>

                  <span
                    className={
                      train.decision === "HOLD"
                        ? "text-red"
                        : "decision decision-yellow"
                    }
                  >
                    {train.decision}
                  </span>

                </div>

              ))}

            </section>

          </section>

        )}

        {/* ANALYTICS */}

        {activePage === "Analytics" && (

          <section>

            <div style={{ marginTop: "28px" }}>

              <p className="label">
                FLEET ANALYTICS
              </p>

              <h2
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "30px",
                }}
              >
                Operational Overview
              </h2>

            </div>

            <section className="mini-grid">

              <div className="mini-card">
                <div className="mini-icon">✓</div>
                <div>
                  <p>READINESS</p>
                  <h3>{stats.readiness}%</h3>
                  <small>calculated from decisions</small>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon">◷</div>
                <div>
                  <p>STANDBY</p>
                  <h3>{stats.standby}</h3>
                  <small>requires planning</small>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon">⚠</div>
                <div>
                  <p>ALERTS</p>
                  <h3>{alerts.length}</h3>
                  <small>attention required</small>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon">↗</div>
                <div>
                  <p>AVG MILEAGE</p>
                  <h3>
                    {(stats.averageMileage / 1000).toFixed(1)}k
                  </h3>
                  <small>demo dataset</small>
                </div>
              </div>

            </section>

            <section className="card fleet-card">

              <p className="label">
                DECISION LOGIC
              </p>

              <h2
                style={{
                  fontFamily: "Space Grotesk",
                }}
              >
                How the recommendation works
              </h2>

              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gap: "12px",
                }}
              >

                <p>① Fitness verification → safety gate</p>
                <p>② Maintenance check → operational constraint</p>
                <p>③ Mileage analysis → balance utilisation</p>
                <p>④ Branding priority → commercial consideration</p>
                <p>⑤ Weighted score → INDUCT / STANDBY / HOLD</p>

              </div>

            </section>

          </section>

        )}

        {/* SETTINGS */}

        {activePage === "Settings" && (

          <section className="coming-soon">

            <div className="coming-icon">
              ⚙
            </div>

            <p className="label">
              SYSTEM
            </p>

            <h2>
              Data & System Settings
            </h2>

            <p>
              TRACKX uses KMRL public information for fleet identity
              and a demonstration operational dataset for the prototype.
            </p>

            <button
              className="dark-button back-button"
              onClick={() => setActivePage("Dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>

        )}

        {/* DETAIL MODAL */}

        {selectedTrain && (

          <div
            onClick={() => setSelectedTrain(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >

            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(500px, 90vw)",
                padding: "28px",
                borderRadius: "20px",
                background: darkMode
                  ? "#202b29"
                  : "#ffffff",
                color: darkMode
                  ? "#ffffff"
                  : "#172727",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,.25)",
              }}
            >

              <p className="label">
                TRAINSET DETAIL
              </p>

              <h2
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "28px",
                }}
              >
                {selectedTrain.name}
              </h2>

              <p>
                {selectedTrain.id}
              </p>

              <hr />

              <p>
                <b>Decision score:</b>{" "}
                {selectedTrain.score}/100
              </p>

              <p>
                <b>Fitness:</b>{" "}
                {selectedTrain.fitness}
              </p>

              <p>
                <b>Mileage:</b>{" "}
                {selectedTrain.mileage.toLocaleString()} km
              </p>

              <p>
                <b>Maintenance:</b>{" "}
                {selectedTrain.maintenance}
              </p>

              <p>
                <b>Branding:</b>{" "}
                {selectedTrain.branding}
              </p>

              <p>
                <b>Recommendation:</b>{" "}
                {selectedTrain.decision}
              </p>

              <h4>
                Decision reasoning
              </h4>

              <ul>
                {selectedTrain.reasons.map((reason) => (
                  <li key={reason}>
                    {reason}
                  </li>
                ))}
              </ul>

              <button
                className="dark-button"
                onClick={() => setSelectedTrain(null)}
              >
                Close
              </button>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;
