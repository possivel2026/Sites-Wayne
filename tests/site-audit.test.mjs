import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSiteAudit, siteAuditCriteria } from "../lib/site-audit.ts";

function answers(value) {
  return Object.fromEntries(siteAuditCriteria.map((criterion) => [criterion.id, value]));
}

test("auditoria exige os dez critérios para ficar completa", () => {
  const result = evaluateSiteAudit({ identity: 2, cta: 1 });
  assert.equal(result.complete, false);
  assert.equal(result.answered, 2);
  assert.equal(result.score, 3);
});

test("pontuação baixa recomenda reconstrução sem prometer resultado", () => {
  const result = evaluateSiteAudit(answers(0));
  assert.equal(result.score, 0);
  assert.equal(result.stage, "Reconstrução");
  assert.equal(result.recommendation, "Profissional");
  assert.equal(result.priorities.length, 3);
});

test("pontuação intermediária recomenda correção focada", () => {
  const result = evaluateSiteAudit(answers(1));
  assert.equal(result.score, 10);
  assert.equal(result.stage, "Correção");
  assert.equal(result.recommendation, "Essencial");
});

test("pontuação alta preserva o site e recomenda manutenção", () => {
  const result = evaluateSiteAudit(answers(2));
  assert.equal(result.complete, true);
  assert.equal(result.score, 20);
  assert.equal(result.percentage, 100);
  assert.equal(result.stage, "Otimização");
  assert.equal(result.recommendation, "Wayne Care");
  assert.deepEqual(result.priorities, []);
});
