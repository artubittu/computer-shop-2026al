import { describe, expect, it } from "vitest";

import { parseProductId } from "./route-id";

describe("parseProductId", () => {
  it("akceptuje poprawne identyfikatory", () => {
    expect(parseProductId("1")).toBe(1);
    expect(parseProductId("25")).toBe(25);
    expect(parseProductId("2147483647")).toBe(2147483647);
  });

  it("odrzuca tekst zamiast liczby", () => {
    expect(parseProductId("abc")).toBeNull();
  });

  it("odrzuca tekst zaczynający się od liczby", () => {
    expect(parseProductId("12abc")).toBeNull();
  });

  it("odrzuca zero", () => {
    expect(parseProductId("0")).toBeNull();
  });

  it("odrzuca liczby ujemne", () => {
    expect(parseProductId("-1")).toBeNull();
  });

  it("odrzuca znak plus", () => {
    expect(parseProductId("+1")).toBeNull();
  });

  it("odrzuca zera wiodące", () => {
    expect(parseProductId("01")).toBeNull();
  });

  it("odrzuca pustą wartość", () => {
    expect(parseProductId("")).toBeNull();
  });

  it("odrzuca wartość większą niż dozwolony zakres", () => {
    expect(parseProductId("2147483648")).toBeNull();
  });

  it("odrzuca liczbę poza bezpiecznym zakresem JavaScript", () => {
    expect(parseProductId("9007199254740992")).toBeNull();
  });
});