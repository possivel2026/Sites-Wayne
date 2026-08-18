import assert from "node:assert/strict";
import test from "node:test";
import { isUuid, parseMarketplaceCart } from "../lib/validation.ts";

const productId = "1d1b2e79-2eb4-4c45-9a56-30d716678c79";

test("validação UUID rejeita padrões permissivos e aceita UUID real", () => {
  assert.equal(isUuid(productId), true);
  assert.equal(isUuid("------------------------------------"), false);
  assert.equal(isUuid("1d1b2e79-2eb4-0c45-9a56-30d716678c79"), false);
});

test("carrinho aceita somente IDs únicos e quantidades limitadas", () => {
  assert.deepEqual(parseMarketplaceCart([{ productId, quantity: 2 }]), { ok: true, items: [{ product_id: productId, quantity: 2 }] });
  assert.deepEqual(parseMarketplaceCart([{ productId, quantity: 0 }]), { ok: false });
  assert.deepEqual(parseMarketplaceCart([{ productId, quantity: 1 }, { productId, quantity: 1 }]), { ok: false });
});
