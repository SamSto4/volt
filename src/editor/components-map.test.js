import { describe, expect, it } from "vitest";
import { manifests } from "@/registry";
import { componentsByName } from "./components-map";

describe("components map", () => {
  it("has a component for every manifest, and a manifest for every component", () => {
    const manifestNames = manifests.map((manifest) => manifest.name).sort();
    expect(Object.keys(componentsByName).sort()).toEqual(manifestNames);
  });
});
