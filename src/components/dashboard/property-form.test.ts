import { describe, expect, it } from "vitest";
import { isPresetDhakaArea } from "./property-form";

describe("isPresetDhakaArea", () => {
  it("returns true for listed preset areas", () => {
    expect(isPresetDhakaArea("Uttara")).toBe(true);
  });

  it("returns false for custom areas", () => {
    expect(isPresetDhakaArea("Purbachal")).toBe(false);
  });
});
