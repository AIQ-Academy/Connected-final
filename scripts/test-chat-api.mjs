import assert from "node:assert/strict";

const baseUrl = process.env.CHAT_TEST_URL ?? "http://localhost:3000";

async function ask(text) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [{ id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text }] }],
    }),
  });
  assert.equal(response.status, 200, `Expected 200 for: ${text}`);
  return response.text();
}

const englishContact = await ask("How can I contact you?");
assert.match(englishContact, /support@connectfunded\.com/);

const frenchContact = await ask("Comment contacter votre équipe ?");
assert.match(frenchContact, /Vous pouvez joindre l’équipe/);

const arabicContact = await ask("كيف أتواصل معكم؟");
assert.match(arabicContact, /يمكنك التواصل مع الفريق/);

const retrieved = await ask("Tell me about funded evaluation packages and their prices");
assert.match(retrieved, /\/register/);
assert.doesNotMatch(retrieved, /AI Gateway|lost the connection|not configured yet/i);

const tooLong = await ask("a".repeat(4_100));
assert.match(tooLong, /That message is too long/);

const invalid = await fetch(`${baseUrl}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ messages: [] }),
});
assert.equal(invalid.status, 400);

const oversized = await fetch(`${baseUrl}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ messages: [{ id: "large", role: "user", parts: [{ type: "text", text: "x".repeat(81_000) }] }] }),
});
assert.equal(oversized.status, 413);

console.log("Chat API smoke checks passed (EN/FR/AR, retrieval, size limits, invalid input).");
