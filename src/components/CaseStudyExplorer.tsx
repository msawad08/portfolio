import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { caseStudies } from "../content/case-studies";

const CaseStudyMap3D = lazy(() => import("./CaseStudyMap3D"));

type CaseStudyExplorerProps = {
  activeCaseId: string;
  onCaseSelect: (caseId: string) => void;
};

function CaseStudyExplorer({
  activeCaseId,
  onCaseSelect,
}: CaseStudyExplorerProps) {
  const activeCase =
    caseStudies.find((item) => item.id === activeCaseId) ?? caseStudies[0];
  const [featureSelection, setFeatureSelection] = useState({
    caseId: activeCase.id,
    featureId: activeCase.features[0].id,
  });
  const mapTriggerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const activeFeatureId =
    featureSelection.caseId === activeCase.id
      ? featureSelection.featureId
      : activeCase.features[0].id;
  const activeFeature =
    activeCase.features.find((feature) => feature.id === activeFeatureId) ??
    activeCase.features[0];

  const selectCase = (caseId: string) => {
    const nextCase = caseStudies.find((item) => item.id === caseId);
    if (!nextCase) return;
    onCaseSelect(nextCase.id);
  };

  const selectFeature = (featureId: string) => {
    if (activeCase.features.some((feature) => feature.id === featureId)) {
      setFeatureSelection({ caseId: activeCase.id, featureId });
    }
  };

  useEffect(() => {
    const target = mapTriggerRef.current;
    if (!target || shouldLoadMap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadMap(true);
        observer.disconnect();
      },
      { rootMargin: "350px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadMap]);

  return (
    <section
      className="explorer-section section-pad"
      id="approach"
      aria-labelledby="explorer-title"
    >
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              HOW THE WORK FITS TOGETHER <span className="eyebrow-line" />
            </p>
            <h2 id="explorer-title">Explore the work behind the features.</h2>
          </div>
          <p className="section-intro">
            Choose a project, then explore its system areas in 3D or use the
            feature list to read about my contribution.
          </p>
        </div>

        <div className="case-tabs" role="group" aria-label="Selected projects">
          {caseStudies.map((study) => (
            <button
              key={study.id}
              type="button"
              aria-pressed={study.id === activeCase.id}
              className={
                study.id === activeCase.id ? "case-tab active" : "case-tab"
              }
              onClick={() => selectCase(study.id)}
            >
              <span>{study.number}</span>
              {study.title}
            </button>
          ))}
        </div>

        <div className="case-panel" id="case-panel" aria-live="polite">
          <div className="case-panel-heading">
            <div>
              <p className="project-type">{activeCase.type}</p>
              <h3>{activeCase.title}</h3>
              <p className="case-summary">{activeCase.summary}</p>
            </div>
            <div className="case-period">
              <span>ROLE &amp; PERIOD</span>
              <strong>{activeCase.role}</strong>
              <span>{activeCase.period}</span>
            </div>
          </div>

          <div className="case-explorer-grid">
            <div className="case-architecture">
              <p className="mini-label">INTERACTIVE 3D · SELECT A FEATURE</p>
              <div ref={mapTriggerRef}>
                {shouldLoadMap ? (
                  <Suspense
                    fallback={
                      <div className="case-map-loading" role="status">
                        Loading the interactive system map…
                      </div>
                    }
                  >
                    <CaseStudyMap3D
                      caseTitle={activeCase.title}
                      features={activeCase.features}
                      activeFeatureId={activeFeature.id}
                      onFeatureSelect={selectFeature}
                    />
                  </Suspense>
                ) : (
                  <div className="case-map-stage case-map-poster">
                    <div className="case-map-canvas-wrap" aria-hidden="true">
                      <span>3D</span>
                      <span>AI</span>
                      <span>WEB</span>
                      <span>DATA</span>
                      <div />
                    </div>
                    <button
                      className="case-map-load"
                      type="button"
                      onClick={() => setShouldLoadMap(true)}
                    >
                      Load interactive 3D map <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                )}
              </div>
              <p className="mini-label case-components-label">
                COMPONENTS · SELECT TO EXPLORE
              </p>
              <div
                className="case-layer-list"
                role="group"
                aria-label={`${activeCase.title} system areas`}
              >
                {activeCase.layers.map((layer, index) => {
                  const isActive = activeFeature.id === layer.featureId;
                  return (
                    <div className="case-layer-wrap" key={layer.id}>
                      <button
                        type="button"
                        className={
                          isActive ? "case-layer active" : "case-layer"
                        }
                        aria-pressed={isActive}
                        onClick={() => selectFeature(layer.featureId)}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{layer.title}</strong>
                        <span className="layer-caret" aria-hidden="true">
                          ↗
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="technology-row">
                {activeCase.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </div>

            <article className="feature-detail" aria-live="polite">
              <div className="feature-detail-topline">
                <span className="mini-label">FEATURE / CONTRIBUTION</span>
                <span className="feature-index">
                  {String(
                    activeCase.features.findIndex(
                      (feature) => feature.id === activeFeature.id,
                    ) + 1,
                  ).padStart(2, "0")}
                  <span>
                    {" "}
                    / {String(activeCase.features.length).padStart(2, "0")}
                  </span>
                </span>
              </div>
              <div className="feature-selector">
                {activeCase.features.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    aria-pressed={feature.id === activeFeature.id}
                    className={
                      feature.id === activeFeature.id
                        ? "feature-choice active"
                        : "feature-choice"
                    }
                    onClick={() => selectFeature(feature.id)}
                  >
                    {feature.title}
                  </button>
                ))}
              </div>
              <h4>{activeFeature.title}</h4>
              <p className="feature-summary">{activeFeature.summary}</p>
              <ul className="feature-details">
                {activeFeature.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              {activeCase.outcomes.length > 0 && (
                <div className="case-outcomes">
                  <p className="mini-label">OUTCOMES REPORTED IN THE RESUME</p>
                  <div>
                    {activeCase.outcomes.map((outcome) => (
                      <article key={outcome.value}>
                        <strong>{outcome.value}</strong>
                        <span>{outcome.label}</span>
                      </article>
                    ))}
                  </div>
                  <small>
                    These are reported outcomes from the professional project,
                    not measurements of this portfolio.
                  </small>
                </div>
              )}
            </article>
          </div>
          <div className="case-panel-footer">
            <span>CONTENT SOURCE · SUPPLIED RESUME</span>
            <span>Employer system and assets are not reproduced here.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CaseStudyExplorer;
