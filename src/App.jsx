
import { useState } from "react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const trains = [
    {
      id: "KMRL-01",
      fitness: "Valid",
      mileage: "42,180 km",
      branding: "High",
      maintenance: "Clear",
      decision: "INDUCT",
    },
    {
      id: "KMRL-02",
      fitness: "Valid",
      mileage: "38,920 km",
      branding: "Medium",
      maintenance: "Clear",
      decision: "INDUCT",
    },
    {
      id: "KMRL-03",
      fitness: "Valid",
      mileage: "51,240 km",
      branding: "High",
      maintenance: "Due",
      decision: "STANDBY",
    },
    {
      id: "KMRL-04",
      fitness: "Valid",
      mileage: "35,670 km",
      branding: "Low",
      maintenance: "Clear",
      decision: "INDUCT",
    },
  ];

  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="logo-area">
          <div className="logo-box">K</div>

          <div>
            <h2>KMRL</h2>
            <p>SMART METRO OPERATIONS</p>
          </div>
        </div>

        <p className="nav-title">MAIN MENU</p>

        <nav>

          <button
            className={activePage === "Dashboard" ? "nav-active" : ""}
            onClick={() => setActivePage("Dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={activePage === "Fleet" ? "nav-active" : ""}
            onClick={() => setActivePage("Fleet")}
          >
            <span>🚇</span>
            Fleet
          </button>

          <button
            className={activePage === "Schedule" ? "nav-active" : ""}
            onClick={() => setActivePage("Schedule")}
          >
            <span>◷</span>
            Schedule
          </button>

          <button
            className={activePage === "Alerts" ? "nav-active" : ""}
            onClick={() => setActivePage("Alerts")}
          >
            <span>⚠</span>
            Alerts
            <span className="notification">3</span>
          </button>

          <button
            className={activePage === "Analytics" ? "nav-active" : ""}
            onClick={() => setActivePage("Analytics")}
          >
            <span>◈</span>
            Analytics
          </button>

        </nav>

        <p className="nav-title second-title">SYSTEM</p>

        <nav>
          <button
            className={activePage === "Settings" ? "nav-active" : ""}
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
            <p>All services operational</p>
          </div>
        </div>

        {/* ===== TRAIN AT BOTTOM OF SIDEBAR ===== */}

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

      {/* ================= MAIN ================= */}

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
  Review fleet readiness, constraints, and today's recommended inductions
</p>
          </div>

          <div className="profile-area">

            <div className="sync">
              <span>●</span> Data synced 2 min ago
            </div>

            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀" : "☾"}
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

        {/* ================= DASHBOARD ================= */}

        {activePage === "Dashboard" && (
          <>

            {/* QUICK STATS */}

            <section className="quick-grid">

              <div className="quick-card green-card">

                <div className="quick-icon">
                  ✓
                </div>

                <div>
                  <p>READY FOR SERVICE</p>
                  <h2>18</h2>
                  <span>of 25 trainsets</span>
                </div>

                <small className="positive">
                  +2 today
                </small>

              </div>

              <div className="quick-card yellow-card">

                <div className="quick-icon">
                  ◷
                </div>

                <div>
                  <p>STANDBY</p>
                  <h2>4</h2>
                  <span>trainsets</span>
                </div>

                <small>16%</small>

              </div>

              <div className="quick-card red-card">

                <div className="quick-icon">
                  ⚠
                </div>

                <div>
                  <p>MAINTENANCE</p>
                  <h2>3</h2>
                  <span>in IBL</span>
                </div>

                <small>2 due</small>

              </div>

              <div className="quick-card blue-card">

                <div className="quick-icon">
                  ↗
                </div>

                <div>
                  <p>PUNCTUALITY</p>
                  <h2>99.6%</h2>
                  <span>target 99.5%</span>
                </div>

                <small className="positive">
                  +0.1%
                </small>

              </div>

            </section>

            {/* FLEET + AI */}

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
                    25 Trainsets
                  </button>

                </div>

                <div className="fleet-content">

                  <div className="donut">

                    <div className="donut-hole">
                      <strong>72%</strong>
                      <span>READY</span>
                    </div>

                  </div>

                  <div className="legend">

                    <div>
                      <span className="dot green-dot"></span>
                      <span>Ready</span>
                      <strong>18</strong>
                    </div>

                    <div>
                      <span className="dot yellow-dot"></span>
                      <span>Standby</span>
                      <strong>4</strong>
                    </div>

                    <div>
                      <span className="dot red-dot"></span>
                      <span>Maintenance</span>
                      <strong>3</strong>
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

                    <strong>18</strong>

                    <span>
                      trains
                      <br />
                      recommended
                    </span>

                  </div>

                  <div className="ai-reasons">

                    <p>✓ Fitness certificates verified</p>
                    <p>✓ Mileage balanced</p>
                    <p>✓ Branding commitments met</p>
                    <p>✓ Maintenance constraints checked</p>

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

            {/* MINI CARDS */}

            <section className="mini-grid">

              <div className="mini-card">
                <div className="mini-icon">✓</div>
                <div>
                  <p>FITNESS</p>
                  <h3>23 / 25</h3>
                  <small>certificates valid</small>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon">▣</div>
                <div>
                  <p>MAINTENANCE</p>
                  <h3>21</h3>
                  <small>jobs closed today</small>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon">◉</div>
                <div>
                  <p>BRANDING</p>
                  <h3>94%</h3>
                  <small>exposure target</small>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon">↗</div>
                <div>
                  <p>MILEAGE</p>
                  <h3>Balanced</h3>
                  <small>fleet distribution</small>
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
                    Tonight's Trainset Decisions
                  </h2>
                </div>

                <button className="outline-button">
                  View Full Plan →
                </button>

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

                {trains.map((train) => (

                  <div className="train-row" key={train.id}>

                    <strong>{train.id}</strong>

                    <span className="text-green">
                      ✓ {train.fitness}
                    </span>

                    <span>{train.mileage}</span>

                    <span>{train.branding}</span>

                    <span
                      className={
                        train.maintenance === "Due"
                          ? "text-red"
                          : "text-green"
                      }
                    >
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

          </>
        )}

        {/* ================= OTHER PAGES ================= */}

        {activePage !== "Dashboard" && (

          <section className="coming-soon">

            <div className="coming-icon">

              {activePage === "Fleet" && "🚇"}
              {activePage === "Schedule" && "◷"}
              {activePage === "Alerts" && "⚠"}
              {activePage === "Analytics" && "◈"}
              {activePage === "Settings" && "⚙"}

            </div>

            <p className="label">
              {activePage.toUpperCase()}
            </p>

            <h2>
              {activePage}
            </h2>

            <p>
              This section is ready for the next stage
              of the KMRL operations platform.
            </p>

            <button
              className="dark-button back-button"
              onClick={() => setActivePage("Dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;
