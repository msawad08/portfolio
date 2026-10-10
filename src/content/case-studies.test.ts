import { describe, expect, it } from "vitest";
import { caseStudies } from "./case-studies";

describe("case study content", () => {
  it("has unique project and feature identifiers", () => {
    expect(new Set(caseStudies.map((study) => study.id)).size).toBe(
      caseStudies.length,
    );

    for (const study of caseStudies) {
      expect(new Set(study.features.map((feature) => feature.id)).size).toBe(
        study.features.length,
      );
      expect(
        study.layers.every((layer) =>
          study.features.some((feature) => feature.id === layer.featureId),
        ),
      ).toBe(true);
    }
  });

  it("includes each featured project and the measured interior outcomes", () => {
    expect(caseStudies.map((study) => study.id)).toEqual([
      "omni-3d",
      "webgl-editor",
      "homelane",
      "geospatial",
      "timesheet-ai",
    ]);
    expect(
      caseStudies.find((study) => study.id === "homelane")?.outcomes,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "50,000+" }),
        expect.objectContaining({ value: "80%" }),
        expect.objectContaining({ value: "40%" }),
      ]),
    );
    expect(
      caseStudies.find((study) => study.id === "timesheet-ai")?.features,
    ).toHaveLength(5);
  });

  it("provides a numeric outcome for every project and marks Timesheet AI projections", () => {
    const timesheet = caseStudies.find((study) => study.id === "timesheet-ai");

    expect(caseStudies.every((study) => study.outcomes.length > 0)).toBe(true);
    expect(
      caseStudies.every((study) =>
        study.outcomes.some(({ value }) => /\d/.test(value)),
      ),
    ).toBe(true);
    expect(timesheet?.outcomesAreProjected).toBe(true);
    expect(timesheet?.outcomes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: "50%",
          label: expect.stringContaining("projected"),
        }),
      ]),
    );
    expect(
      caseStudies
        .filter((study) => study.id !== "timesheet-ai")
        .every((study) => !study.outcomesAreProjected),
    ).toBe(true);
  });
});
