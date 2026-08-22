import assert from "node:assert/strict";
import test from "node:test";
import { gameDevMissions, getGameDevProgress } from "../lib/game-dev-roadmap.ts";

test("trilha contém doze missões em sequência", () => {
  assert.equal(gameDevMissions.length, 12);
  assert.equal(gameDevMissions[0].id, "logic");
  assert.equal(gameDevMissions.at(-1).id, "publishing");
});

test("progresso ignora duplicatas e identificadores desconhecidos", () => {
  const progress = getGameDevProgress(["logic", "logic", "unknown"]);
  assert.equal(progress.completedCount, 1);
  assert.equal(progress.percentage, 8);
  assert.equal(progress.nextMission?.id, "math");
});

test("trilha completa não inventa uma próxima missão", () => {
  const progress = getGameDevProgress(gameDevMissions.map((mission) => mission.id));
  assert.equal(progress.complete, true);
  assert.equal(progress.percentage, 100);
  assert.equal(progress.nextMission, null);
});
