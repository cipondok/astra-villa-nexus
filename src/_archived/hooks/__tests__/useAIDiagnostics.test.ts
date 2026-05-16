import { describe, it, expect } from "vitest";
import { diagnoseAISystem } from "../useAIDiagnostics";

describe("diagnoseAISystem", () => {
  it("returns FULLY ACTIVE for healthy system", () => {
    const r = diagnoseAISystem({ actions_count: 30, execution_logs: 500, widgets: 15, db_updates: 200 });
    expect(r.ai_system_status).toBe("FULLY ACTIVE");
  });

  it("returns NOT ACTIVE for zero signals", () => {
    const r = diagnoseAISystem({ actions_count: 0, execution_logs: 0, widgets: 0, db_updates: 0 });
    expect(r.ai_system_status).toBe("NOT ACTIVE");
    expect(r.composite_score).toBe(0);
  });

  it("returns PARTIALLY ACTIVE for mixed signals", () => {
    const r = diagnoseAISystem({ actions_count: 10, execution_logs: 5, widgets: 2, db_updates: 1 });
    expect(r.ai_system_status).toBe("PARTIALLY ACTIVE");
  });

  it("identifies weakest area as integration issue", () => {
    const r = diagnoseAISystem({ actions_count: 20, execution_logs: 100, widgets: 0, db_updates: 50 });
    expect(r.integration_issue).toContain("widgets");
    expect(r.priority_test_module).toContain("Widget");
  });

  it("provides fix steps array", () => {
    const r = diagnoseAISystem({ actions_count: 1, execution_logs: 1, widgets: 1, db_updates: 1 });
    expect(r.fix_steps.length).toBeGreaterThanOrEqual(3);
  });
});
