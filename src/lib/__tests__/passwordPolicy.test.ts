import { describe, it, expect } from "vitest";
import { analyzePassword, getPasswordError, isCommonPassword, PASSWORD_MIN_LENGTH } from "../passwordPolicy";

describe("password policy", () => {
  it("requires at least 10 characters", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(10);
    expect(getPasswordError("Xk#9vTq2")).not.toBeNull();
    expect(getPasswordError("Xk#9vTq2mW")).toBeNull();
  });

  it("requires uppercase, lowercase, number and special character", () => {
    expect(getPasswordError("xk#9vtq2mwzr")).not.toBeNull();
    expect(getPasswordError("XK#9VTQ2MWZR")).not.toBeNull();
    expect(getPasswordError("Xk#avTqbmWzr")).not.toBeNull();
    expect(getPasswordError("Xk9avTqbmWzr")).not.toBeNull();
  });

  it("rejects common passwords and simple variations even when complex", () => {
    for (const pw of ["Password123!", "P@ssw0rd2026!", "Qwerty!23456", "Astravilla2024!", "Bismillah123!", "Sayangku#2025", "Indonesia45!"]) {
      expect(isCommonPassword(pw)).toBe(true);
      expect(analyzePassword(pw).acceptable).toBe(false);
      expect(analyzePassword(pw).strength).toBe("weak");
    }
  });

  it("rejects passwords containing the person's name or email", () => {
    expect(getPasswordError("Budiman#2025x", { email: "budiman@example.com" })).not.toBeNull();
    expect(getPasswordError("Xk#9Siti2025", { name: "Siti Rahayu" })).not.toBeNull();
    expect(getPasswordError("Rahayu#2025x", { name: "Siti Rahayu" })).not.toBeNull();
  });

  it("rejects passwords with repeated characters", () => {
    expect(getPasswordError("Aaaaaa1!aaaa")).not.toBeNull();
  });

  it("accepts a long, unique password", () => {
    const a = analyzePassword("Kopi-Senja#Ubud42", { email: "jane@example.com", name: "Jane Doe" });
    expect(a.acceptable).toBe(true);
    expect(a.strength).toBe("strong");
  });
});
