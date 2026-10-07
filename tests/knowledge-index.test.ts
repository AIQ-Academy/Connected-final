import assert from "node:assert/strict";
import { test } from "node:test";

import { knowledgeTokens } from "../src/lib/chat/knowledge-index.ts";
import { expandDomainTerms } from "../src/lib/chat/domain-terms.ts";

test("malformed localized keywords cannot crash tokenization", () => {
  const tokens = [undefined, null, 42, "", "Compte Gold"].flatMap(knowledgeTokens);
  assert.deepEqual(tokens, ["compte", "gold"]);
});

test("English, French, and Arabic trading terms resolve to the same account concepts", () => {
  const questions = [
    expandDomainTerms("What is the leverage for the Pro account?", "en"),
    expandDomainTerms("Quel est le levier du compte Pro ?", "fr"),
    expandDomainTerms("ما الرافعة المالية لحساب Pro؟", "ar"),
  ];
  for (const terms of questions) {
    assert.ok(terms.includes("leverage"));
    assert.ok(terms.includes("account"));
    assert.ok(terms.includes("pro"));
  }
  assert.ok(expandDomainTerms("Quel est l'écart sur l'or ?", "fr").includes("gold"));
  assert.equal(expandDomainTerms("markets or platforms", "en").includes("gold"), false);
});
