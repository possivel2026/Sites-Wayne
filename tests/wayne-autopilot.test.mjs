import assert from "node:assert/strict";
import test from "node:test";
import { cleanPhone, parseSiteOrderInput, slugifyBusiness, waynePackages } from "../lib/wayne-autopilot.ts";

const validOrder = {
  packageId: "profissional",
  templateId: "luxo",
  businessName: "Clínica Wayne",
  businessType: "Clínica",
  headline: "Atendimento humano e eficiente",
  city: "Divinópolis",
  publicWhatsApp: "+55 (37) 99958-4722",
  services: ["Consulta", "Avaliação", "Acompanhamento"],
  clientName: "Responsável Wayne",
  clientEmail: "responsavel@example.com",
  acceptedTerms: true,
};

test("preços financeiros permanecem em centavos no servidor", () => {
  assert.equal(waynePackages.essencial.priceCents, 29_700);
  assert.equal(waynePackages.profissional.priceCents, 69_700);
  assert.equal(waynePackages.growth.priceCents, 149_700);
});

test("pedido válido separa dados públicos e privados", () => {
  const result = parseSiteOrderInput(validOrder);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.siteData.publicWhatsApp, "5537999584722");
    assert.equal(result.data.clientEmail, "responsavel@example.com");
    assert.equal("clientEmail" in result.data.siteData, false);
  }
});

test("publicação exige consentimento, contato e ao menos dois serviços", () => {
  for (const invalid of [
    { ...validOrder, acceptedTerms: false },
    { ...validOrder, publicWhatsApp: "123" },
    { ...validOrder, services: ["Consulta"] },
  ]) assert.equal(parseSiteOrderInput(invalid).ok, false);
});

test("entrada pública remove marcação HTML e gera slug estável", () => {
  const result = parseSiteOrderInput({ ...validOrder, businessName: "<b>Café & Ação</b>" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.siteData.businessName, "Café & Ação");
  assert.equal(slugifyBusiness("Café & Ação"), "cafe-acao");
  assert.equal(cleanPhone("+55 (37) 99958-4722"), "5537999584722");
});
