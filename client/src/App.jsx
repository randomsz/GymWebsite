import React from "react";
import { fetchClasses, fetchMemberships, submitContact } from "./api.js";

function useAsyncResource(loader) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    loader()
      .then((result) => {
        if (!alive) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [loader]);

  return { data, error, loading };
}

export default function App() {
  const year = new Date().getFullYear();
  const classes = useAsyncResource(React.useCallback(fetchClasses, []));
  const memberships = useAsyncResource(React.useCallback(fetchMemberships, []));

  const [contact, setContact] = React.useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = React.useState({ state: "idle", message: "" });

  async function onSubmitContact(e) {
    e.preventDefault();
    setContactStatus({ state: "loading", message: "" });
    try {
      const result = await submitContact(contact);
      setContact({ name: "", email: "", message: "" });
      setContactStatus({ state: "success", message: `Sent! Reference: ${result.id}` });
    } catch (err) {
      setContactStatus({ state: "error", message: err?.message || "Failed to send message" });
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="#" aria-label="Fit & Fine home">
            <img className="brand-mark" src="/img/body.png" alt="" aria-hidden="true" />
            <span className="brand-text">
              <span className="brand-name">Fit &amp; Fine</span>
              <span className="brand-tagline">Gym &amp; Fitness Studio</span>
            </span>
          </a>

          <nav className="nav" aria-label="Primary">
            <a className="nav-link" href="#classes">
              Classes
            </a>
            <a className="nav-link" href="#trainers">
              Trainers
            </a>
            <a className="nav-link" href="#pricing">
              Pricing
            </a>
            <a className="nav-link" href="#contact">
              Contact
            </a>
          </nav>

          <div className="header-cta">
            <a className="btn btn-ghost" href="#contact">
              Book a tour
            </a>
            <a className="btn btn-primary" href="#pricing">
              Join now
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-label="Intro">
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <p className="pill">New member special &bull; First week free</p>
              <h1>Build strength. Boost energy. Feel unstoppable.</h1>
              <p className="lead">
                A friendly gym with coaching, classes, and a plan that fits your schedule&mdash;whether you&rsquo;re
                starting out or leveling up.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#pricing">
                  View memberships
                </a>
                <a className="btn btn-ghost" href="#classes">
                  Explore classes
                </a>
              </div>

              <dl className="stats" aria-label="Gym highlights">
                <div className="stat">
                  <dt>Open</dt>
                  <dd>5am&ndash;11pm</dd>
                </div>
                <div className="stat">
                  <dt>Classes</dt>
                  <dd>40+ / week</dd>
                </div>
                <div className="stat">
                  <dt>Support</dt>
                  <dd>Coaches on-site</dd>
                </div>
              </dl>
            </div>

            <div className="hero-card" aria-label="Featured">
              <div className="badge">Popular</div>
              <h2 className="hero-card-title">Strength + Conditioning</h2>
              <p className="hero-card-sub">Build power, improve mobility, and get a full-body burn.</p>
              <div className="hero-card-meta">
                <span>45&ndash;60 min</span>
                <span>All levels</span>
                <span>Daily</span>
              </div>
              <a className="btn btn-primary btn-block" href="#classes">
                See the schedule
              </a>
              <p className="hero-card-note">Powered by a React frontend + Node API.</p>
            </div>
          </div>
        </section>

        <section className="section" id="classes" aria-label="Classes">
          <div className="wrap">
            <div className="section-head">
              <h2>Classes</h2>
              <p>Pick a class that matches your goals and your pace.</p>
            </div>

            {classes.loading && <p className="muted">Loading classes…</p>}
            {classes.error && <p className="muted">Couldn&rsquo;t load classes from the API.</p>}

            {classes.data?.classes && (
              <div className="grid three">
                {classes.data.classes.map((c) => (
                  <article className="card" key={c.id}>
                    <h3>{c.name}</h3>
                    <p className="muted">
                      {c.durationMinutes} min &bull; {c.level}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section alt" id="trainers" aria-label="Trainers">
          <div className="wrap">
            <div className="section-head">
              <h2>Trainers</h2>
              <p>Friendly coaches who meet you where you are.</p>
            </div>

            <div className="grid three">
              <article className="card trainer">
                <img src="/img/training.jpg" alt="Trainer Alex" />
                <h3>Alex</h3>
                <p className="muted">Strength &amp; mobility</p>
              </article>
              <article className="card trainer">
                <img src="/img/training.jpg" alt="Trainer Priya" />
                <h3>Priya</h3>
                <p className="muted">HIIT &amp; conditioning</p>
              </article>
              <article className="card trainer">
                <img src="/img/training.jpg" alt="Trainer Sam" />
                <h3>Sam</h3>
                <p className="muted">Yoga &amp; recovery</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="pricing" aria-label="Pricing">
          <div className="wrap">
            <div className="section-head">
              <h2>Memberships</h2>
              <p>Simple plans. No surprises.</p>
            </div>

            {memberships.loading && <p className="muted">Loading memberships…</p>}
            {memberships.error && <p className="muted">Couldn&rsquo;t load memberships from the API.</p>}

            {memberships.data?.memberships && (
              <div className="grid three">
                {memberships.data.memberships.map((m) => (
                  <article className="card price" key={m.id}>
                    <h3>{m.name}</h3>
                    <p className="amount">
                      ${m.priceMonthlyUsd} <span>/ month</span>
                    </p>
                    <ul className="list">
                      {m.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <a className="btn btn-primary btn-block" href="#contact">
                      Join now
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section cta" id="contact" aria-label="Contact">
          <div className="wrap">
            <div className="cta-inner">
              <div>
                <h2>Ready to start?</h2>
                <p>Send a message and we&rsquo;ll schedule your tour.</p>
              </div>
              <div className="cta-actions">
                <a className="btn btn-primary" href="#">
                  Call (555) 123-4567
                </a>
                <a className="btn btn-ghost" href="mailto:hello@fitandfine.example">
                  Email us
                </a>
              </div>
            </div>

            <form className="card" style={{ marginTop: 20 }} onSubmit={onSubmitContact}>
              <h3>Message us</h3>
              <div className="grid two" style={{ marginTop: 12 }}>
                <label>
                  <span className="muted">Name</span>
                  <input
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Your name"
                    style={{ width: "100%", marginTop: 6 }}
                  />
                </label>
                <label>
                  <span className="muted">Email</span>
                  <input
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    required
                    type="email"
                    placeholder="you@example.com"
                    style={{ width: "100%", marginTop: 6 }}
                  />
                </label>
              </div>
              <label style={{ display: "block", marginTop: 12 }}>
                <span className="muted">Message</span>
                <textarea
                  value={contact.message}
                  onChange={(e) => setContact((c) => ({ ...c, message: e.target.value }))}
                  required
                  minLength={5}
                  maxLength={2000}
                  placeholder="Tell us what you’re looking for…"
                  rows={5}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <button className="btn btn-primary" type="submit" disabled={contactStatus.state === "loading"}>
                  {contactStatus.state === "loading" ? "Sending…" : "Send"}
                </button>
                {contactStatus.state !== "idle" && <span className="muted">{contactStatus.message}</span>}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <p className="footer-name">Fit &amp; Fine</p>
            <p className="footer-meta">123 Main St &bull; New York, NY</p>
          </div>
          <p className="footer-meta">&copy; {year} Fit &amp; Fine. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
