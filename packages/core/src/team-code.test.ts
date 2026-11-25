import { describe, expect, it } from "vitest";
import { extractTeamCode } from "./team-code";

describe("extractTeamCode", () => {
  it("reads the code in parentheses", () => {
    expect(extractTeamCode("(G9) LA MATRIZ")).toBe("G9");
    expect(extractTeamCode("(G2)CELIANO MONGE")).toBe("G2");
    expect(extractTeamCode("( g 10 ) PISHILATA")).toBe("G10");
    expect(extractTeamCode("(G01) HUACHI")).toBe("G1");
  });

  it("returns null when there is no code in parentheses", () => {
    expect(extractTeamCode("Grupo 9")).toBeNull();
    expect(extractTeamCode("MATRIZ REFERENCIA")).toBeNull();
  });
});
