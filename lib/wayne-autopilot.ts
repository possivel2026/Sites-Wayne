export const waynePackages = {
  essencial: { id: "essencial", name: "Essencial", priceCents: 29700, description: "Presença digital objetiva para começar a receber contatos." },
  profissional: { id: "profissional", name: "Profissional", priceCents: 69700, description: "Estrutura completa para apresentar serviços com autoridade." },
  growth: { id: "growth", name: "Growth", priceCents: 149700, description: "Página orientada a campanhas, captação e evolução." },
} as const;

export const wayneTemplates = {
  claro: { id: "claro", name: "Essencial Claro", description: "Limpo, leve e direto." },
  luxo: { id: "luxo", name: "Autoridade Escura", description: "Premium, sóbrio e elegante." },
  impacto: { id: "impacto", name: "Conversão Vibrante", description: "Contraste forte e chamadas visíveis." },
} as const;

export type WaynePackageId = keyof typeof waynePackages;
export type WayneTemplateId = keyof typeof wayneTemplates;

export type WayneSiteData = {
  businessName: string;
  businessType: string;
  headline: string;
  city: string;
  publicWhatsApp: string;
  services: string[];
};

export type WayneSiteOrder = {
  id: string;
  slug: string;
  package_id: WaynePackageId;
  template_id: WayneTemplateId;
  amount_cents: number;
  status: "pending" | "paid" | "published" | "cancelled" | "refunded";
  payment_status: string;
  provider_preference_id: string | null;
  provider_payment_id: string | null;
  client_name: string;
  client_email: string;
  site_data: WayneSiteData;
  published_at: string | null;
  last_health_status: string | null;
  last_health_check_at: string | null;
  created_at: string;
  updated_at: string;
};

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, maxLength) : "";
}

export function cleanPhone(value: unknown) {
  const digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
  return digits.length >= 12 && digits.length <= 13 ? digits : "";
}

export function slugifyBusiness(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "site-wayne";
}

export function parseSiteOrderInput(value: unknown) {
  const body = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const packageId = cleanText(body.packageId, 24) as WaynePackageId;
  const templateId = cleanText(body.templateId, 24) as WayneTemplateId;
  const rawServices = Array.isArray(body.services) ? body.services : [];
  const siteData: WayneSiteData = {
    businessName: cleanText(body.businessName, 80),
    businessType: cleanText(body.businessType, 80),
    headline: cleanText(body.headline, 150),
    city: cleanText(body.city, 80),
    publicWhatsApp: cleanPhone(body.publicWhatsApp),
    services: rawServices.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 6),
  };
  const clientName = cleanText(body.clientName, 80);
  const clientEmail = cleanText(body.clientEmail, 160).toLowerCase();
  const acceptedTerms = body.acceptedTerms === true;

  if (!waynePackages[packageId] || !wayneTemplates[templateId]) return { error: "Pacote ou modelo inválido." } as const;
  if (!siteData.businessName || !siteData.businessType || !siteData.headline || !siteData.city || !siteData.publicWhatsApp || siteData.services.length < 2) return { error: "Preencha todos os dados públicos do site e pelo menos dois serviços." } as const;
  if (!clientName || !/^\S+@\S+\.\S+$/.test(clientEmail)) return { error: "Informe nome e e-mail válidos para a entrega." } as const;
  if (!acceptedTerms) return { error: "É necessário aceitar os termos e autorizar a publicação." } as const;

  return { data: { packageId, templateId, siteData, clientName, clientEmail } } as const;
}
