import { describe, expect, it } from "vitest";
import { isValidNationalId } from "./national-id";

describe("isValidNationalId", () => {
  it("accepts IDs with a correct check digit", () => {
    expect(isValidNationalId("1710034065")).toBe(true);
    expect(isValidNationalId("1804567897")).toBe(true);
  });

  it("rejects a wrong check digit, province or length", () => {
    expect(isValidNationalId("1710034066")).toBe(false);
    expect(isValidNationalId("9910034065")).toBe(false);
    expect(isValidNationalId("171003406")).toBe(false);
  });
});
