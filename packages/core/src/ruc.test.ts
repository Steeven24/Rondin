import { describe, expect, it } from "vitest";
import { normalizeRuc } from "./ruc";

describe("normalizeRuc", () => {
  it("keeps a valid 13-digit text RUC", () => {
    expect(normalizeRuc("1800893123001")).toEqual({ value: "1800893123001" });
  });

  it("recovers a RUC stored as a number", () => {
    expect(normalizeRuc(1800893123001)).toEqual({ value: "1800893123001" });
  });

  it("flags scientific notation as unrecoverable", () => {
    expect(normalizeRuc("1,8025E+12")).toEqual({ value: null, issue: "scientific_notation" });
  });

  it("restores a dropped leading zero", () => {
    expect(normalizeRuc("190012345001")).toEqual({
      value: "0190012345001",
      issue: "leading_zero_restored",
    });
  });

  it("rejects empty and short values", () => {
    expect(normalizeRuc("").issue).toBe("empty");
    expect(normalizeRuc("12345").issue).toBe("invalid_length");
  });
});
