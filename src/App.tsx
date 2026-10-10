import { useState } from "react";
import CaseStudyExplorer from "./components/CaseStudyExplorer";
import { caseStudies } from "./content/case-studies";
import "./App.css";

const resumeDownloadUrl = import.meta.env.VITE_RESUME_URL?.trim();

function App() {
  const [activeCaseId, setActiveCaseId] = useState(caseStudies[0].id);

  const exploreCase = (caseId: string) => {
    setActiveCaseId(caseId);
    document.getElementById("approach")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Mohammed Sawad home">
          <span className="wordmark-mark">MS</span>
          <span>Mohammed Sawad</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#approach">Architecture</a>
          <a href="#about">About</a>
          {resumeDownloadUrl && (
            <a
              href={resumeDownloadUrl}
              target="_blank"
              rel="noreferrer"
              download
            >
              Resume
            </a>
          )}
          <a href="#contact">Contact</a>
        </nav>
        <a
          className="header-link"
          href="https://github.com/msawad08"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="top">
        <section className="hero content-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> SOFTWARE ARCHITECT · LEAD ENGINEER
            </p>
            <h1 id="hero-title">
              Building systems that bring ideas <em>into focus.</em>
            </h1>
            <p className="hero-summary">
              I design and build intelligent products across AI workflows, cloud
              platforms, full-stack engineering, and real-time 3D.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                My Projects <span aria-hidden="true">↓</span>
              </a>
              {resumeDownloadUrl && (
                <a
                  className="button button-outline"
                  href={resumeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  Download Resume <span aria-hidden="true">↓</span>
                </a>
              )}
            </div>
            <div className="hero-socials" aria-label="Public profiles">
              <a
                href="https://github.com/msawad08"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/mohammed-sawad/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Select a project to explore">
            <div className="hero-project-orbit orbit-one" aria-hidden="true" />
            <div className="hero-project-orbit orbit-two" aria-hidden="true" />
            <div className="hero-project-core" aria-hidden="true">
              <span>MS</span>
              <strong>
                BUILD
                <br />· EXPLORE ·<br />
                ENGINEER
              </strong>
            </div>
            {caseStudies.map((study, index) => (
              <button
                key={study.id}
                type="button"
                className={`hero-project-node hero-project-node-${index + 1}`}
                aria-label={`Explore ${study.title}`}
                onClick={() => exploreCase(study.id)}
              >
                <span>{study.number}</span>
                {study.title}
              </button>
            ))}
            <span className="visual-coordinate">
              SELECT A PROJECT · EXPLORE ITS SYSTEM
            </span>
          </div>
          <div className="hero-foot">
            <span>Independent thinking, end-to-end execution.</span>
            <span className="hero-foot-right">
              Scroll to explore <span aria-hidden="true">⌄</span>
            </span>
          </div>
        </section>

        <section
          className="work-section section-pad"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="content-width">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  SELECTED WORK <span className="eyebrow-line" />
                </p>
                <h2 id="work-title">
                  Complex products, practical engineering.
                </h2>
              </div>
              <p className="section-intro">
                Select a project below to explore the systems, features, and
                engineering work behind it.
              </p>
            </div>
            <div className="project-list">
              {caseStudies.map((study) => (
                <article className="project-row" key={study.id}>
                  <span className="project-number">{study.number}</span>
                  <div className="project-main">
                    <p className="project-type">{study.type}</p>
                    <h3>{study.title}</h3>
                    <p>{study.summary}</p>
                    {study.outcomes.length > 0 && (
                      <div
                        className="impact-stats"
                        aria-label="Resume-reported project outcomes"
                      >
                        {study.outcomes.map((outcome) => (
                          <div key={outcome.value}>
                            <strong>{outcome.value}</strong>
                            <span>{outcome.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <ul className="tag-list" aria-label="Project technologies">
                      {study.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="project-link"
                    type="button"
                    aria-label={`Explore ${study.title}`}
                    onClick={() => exploreCase(study.id)}
                  >
                    <span aria-hidden="true">↗</span>
                  </button>
                </article>
              ))}
              <article className="project-row project-row-pending">
                <span className="project-number">05</span>
                <div className="project-main">
                  <p className="project-type">PRODUCT · SOURCE REVIEW NEEDED</p>
                  <h3>Timesheet AI</h3>
                  <p>
                    Project details will be added after reviewing its source
                    repository and confirming which features are ready to share.
                  </p>
                  <span className="pending-badge">
                    DETAILS PENDING SOURCE REVIEW
                  </span>
                </div>
                <span className="pending-lock" aria-hidden="true">
                  ···
                </span>
              </article>
            </div>
            <div className="projects-caption">
              <span>01 — 05</span>
              <span>
                Project details are grounded in the supplied resume; Timesheet
                AI awaits source verification.
              </span>
            </div>
          </div>
        </section>

        <CaseStudyExplorer
          activeCaseId={activeCaseId}
          onCaseSelect={setActiveCaseId}
        />

        <section
          className="about-section section-pad"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="content-width about-grid">
            <div>
              <p className="eyebrow">
                A LITTLE CONTEXT <span className="eyebrow-line" />
              </p>
              <h2 id="about-title">
                From system design to the details that make it work.
              </h2>
            </div>
            <div className="about-copy">
              <p>
                I’m a software architect and engineer with 9+ years of
                experience building products across real-time 3D, full-stack
                systems, and applied AI. I work from the underlying architecture
                through to the experience people actually use.
              </p>
              <p>
                My work includes AI orchestration, rendering platforms, browser
                tooling, interior-design collaboration, asset pipelines, and
                large-scale geospatial visualization.
              </p>
              <div className="strength-grid">
                <div>
                  <span>01</span>
                  <strong>AI &amp; workflow systems</strong>
                </div>
                <div>
                  <span>02</span>
                  <strong>Real-time 3D platforms</strong>
                </div>
                <div>
                  <span>03</span>
                  <strong>Cloud &amp; distributed systems</strong>
                </div>
                <div>
                  <span>04</span>
                  <strong>Product engineering</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="experience-section section-pad"
          aria-labelledby="experience-title"
        >
          <div className="content-width experience-grid">
            <div>
              <p className="eyebrow">
                EXPERIENCE <span className="eyebrow-line" />
              </p>
              <h2 id="experience-title">A career in building what’s next.</h2>
              <p className="section-intro">
                Titles and dates are taken from the supplied resume.
              </p>
            </div>
            <ol className="timeline">
              <li>
                <span className="timeline-marker" />
                <div>
                  <span className="timeline-date">APR 2026 — NOW</span>
                  <h3>Lead Software Engineer</h3>
                  <p>Omnicom Media Group</p>
                </div>
              </li>
              <li>
                <span className="timeline-marker" />
                <div>
                  <span className="timeline-date">MAY 2023 — APR 2026</span>
                  <h3>Senior Software Engineer</h3>
                  <p>Omnicom Media Group</p>
                </div>
              </li>
              <li>
                <span className="timeline-marker" />
                <div>
                  <span className="timeline-date">NOV 2020 — APR 2023</span>
                  <h3>Software Engineer II</h3>
                  <p>HomeLane</p>
                </div>
              </li>
              <li>
                <span className="timeline-marker" />
                <div>
                  <span className="timeline-date">FEB 2019 — NOV 2020</span>
                  <h3>Software Developer</h3>
                  <p>Izmo Ltd</p>
                </div>
              </li>
              <li>
                <span className="timeline-marker" />
                <div>
                  <span className="timeline-date">JUL 2017 — FEB 2019</span>
                  <h3>Associate Software Developer</h3>
                  <p>Juego Studios Pvt Ltd</p>
                </div>
              </li>
            </ol>
          </div>
          <div className="content-width education-line">
            <span className="timeline-date">
              EDUCATION · AUG 2013 — JUN 2017
            </span>
            <strong>Bachelor of Engineering in Computer Science</strong>
            <span>Bearys Institute of Technology, Bangalore</span>
          </div>
        </section>

        <section
          className="other-apps-section section-pad"
          id="other-apps"
          aria-labelledby="other-apps-title"
        >
          <div className="content-width">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  MORE FROM MY WORK <span className="eyebrow-line" />
                </p>
                <h2 id="other-apps-title">Other apps.</h2>
              </div>
              <p className="section-intro">
                A couple of smaller app projects, separate from my main
                engineering case studies.
              </p>
            </div>
            <div className="other-apps-grid">
              <article className="other-app-card">
                <span className="project-number">01</span>
                <div>
                  <h3>Quran Kannada</h3>
                  <p>
                    Built by me in collaboration with Islamic Way. See the app
                    project and current store listings.
                  </p>
                  <div className="other-app-links">
                    <a
                      href="https://itsallwidgets.com/quran-kannda"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Project page <span aria-hidden="true">↗</span>
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.sawad.qurankannada"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google Play <span aria-hidden="true">↗</span>
                    </a>
                    <a
                      href="https://apps.apple.com/in/app/quran-kannada/id1460722437?platform=iphone"
                      target="_blank"
                      rel="noreferrer"
                    >
                      App Store <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </article>
              <article className="other-app-card">
                <span className="project-number">02</span>
                <div>
                  <h3>Manqoos Mawlid</h3>
                  <p>
                    An app featuring Kannada and English translation and
                    recitation.
                  </p>
                  <div className="other-app-links">
                    <a
                      href="https://itsallwidgets.com/manqoos-mawlid"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Project page <span aria-hidden="true">↗</span>
                    </a>
                    <a
                      href="https://apps.apple.com/app/manqoos-mawlid/id1536435313"
                      target="_blank"
                      rel="noreferrer"
                    >
                      App Store <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="contact-section section-pad"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="content-width contact-inner">
            <div className="contact-orbit" aria-hidden="true">
              <span>MS</span>
            </div>
            <p className="eyebrow">NEXT CHAPTER</p>
            <h2 id="contact-title">
              Let’s make the complex <em>feel clear.</em>
            </h2>
            <p>
              For architecture, platform, or hands-on engineering conversations,
              find me here.
            </p>
            <div className="contact-actions">
              <a
                className="button button-primary"
                href="https://www.linkedin.com/in/mohammed-sawad/"
                target="_blank"
                rel="noreferrer"
              >
                Connect on LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button-outline"
                href="https://github.com/msawad08"
                target="_blank"
                rel="noreferrer"
              >
                Explore GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
            <span className="contact-email-note">
              Direct email address pending confirmation.
            </span>
          </div>
        </section>
      </main>

      <footer className="site-footer content-width">
        <a className="wordmark footer-wordmark" href="#top">
          <span className="wordmark-mark">MS</span>
          <span>Mohammed Sawad</span>
        </a>
        <span>
          Designed &amp; built for the web ·{" "}
          <span className="footer-year">2026</span>
        </span>
        <a href="#top" className="back-top">
          Back to top ↑
        </a>
      </footer>
    </>
  );
}

export default App;
