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

  it("covers the resume-supported featured projects", () => {
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
});
