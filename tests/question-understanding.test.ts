import assert from "node:assert/strict";
import { test } from "node:test";

import { isContextualFollowUp, understandQuestion } from "../src/lib/chat/question-understanding.ts";

test("detects the requested intent and entity in English, French, and Arabic", () => {
  const english = understandQuestion("Where is Connect Funded based?", "en");
  const french = understandQuestion("Quel est le prix du compte Gold ?", "fr");
  const arabic = understandQuestion("ما شروط حساب Gold؟", "ar");
  assert.equal(english.intent, "location");
  assert.ok(english.entities.includes("Connect"));
  assert.equal(french.intent, "pricing");
  assert.ok(french.entities.includes("Gold"));
  assert.equal(arabic.intent, "policy");
  assert.ok(arabic.topicTerms.includes("gold"));
});

test("uses chat history only for explicit follow-up wording", () => {
  assert.equal(isContextualFollowUp("What about crypto markets?"), false);
  assert.equal(isContextualFollowUp("What about its pricing?"), true);
  assert.equal(isContextualFollowUp("How much is it?"), true);
  assert.equal(isContextualFollowUp("Et pour le deuxième ?"), true);
  assert.equal(isContextualFollowUp("وكم سعره؟"), true);
  assert.equal(isContextualFollowUp("وماذا عن حساب VIP؟"), false);
});
