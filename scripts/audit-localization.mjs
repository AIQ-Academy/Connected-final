import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = join(root, "src");
const localeNames = ["en", "fr", "ar"];
const ignoredFiles = new Set([
  "src/lib/i18n/dictionaries/en.ts",
  "src/lib/i18n/dictionaries/fr.ts",
  "src/lib/i18n/dictionaries/ar.ts",
  "src/lib/i18n/page-copy.ts",
  "src/lib/i18n/route-copy.ts",
]);
const visibleAttributes = new Set(["aria-label", "alt", "placeholder", "title"]);
const missing = [];
const duplicate = [];
const empty = [];
const hardcoded = [];
const unused = [];

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
}

function objectForVariable(source, variableName) {
  let result;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
      const initializer = unwrap(node.initializer);
      if (initializer && ts.isObjectLiteralExpression(initializer)) result = initializer;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

function propertyMap(object, fileName) {
  const entries = new Map();
  if (!object) return entries;
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const keyNode = property.name;
    const key = ts.isIdentifier(keyNode) || ts.isStringLiteral(keyNode) ? keyNode.text : null;
    if (key === null) continue;
    if (entries.has(key)) duplicate.push(`${fileName}: duplicate key ${key}`);
    const value = ts.isStringLiteral(property.initializer) ? property.initializer.text : null;
    if (value !== null && !value.trim()) empty.push(`${fileName}: empty value for ${key}`);
    entries.set(key, value);
  }
  return entries;
}

function lineAt(source, node) {
  return source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

function addLiteral(source, file, node, value, kind) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!/[A-Za-z]{2}/.test(clean) || clean.length < 3) return;
  if (/^(?:[A-Z0-9$%./:+_\- ]+|https?:\/\/\S+)$/u.test(clean)) return;
  hardcoded.push(`${file}:${lineAt(source, node)} [${kind}] ${clean}`);
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (/\.tsx?$/.test(entry.name)) result.push(path);
  }
  return result;
}

const dictionarySources = new Map();
for (const locale of localeNames) {
  const file = join(root, `src/lib/i18n/dictionaries/${locale}.ts`);
  const text = await readFile(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  dictionarySources.set(locale, propertyMap(objectForVariable(source, locale), relative(root, file)));
}

function compareSets(label, sourceFile, localeObjects) {
  const [, base] = localeObjects[0];
  for (let index = 1; index < localeObjects.length; index++) {
    const [locale, entries] = localeObjects[index];
    for (const key of base.keys()) if (!entries.has(key)) missing.push(`${label}: ${locale} missing ${key}`);
    for (const key of entries.keys()) if (!base.has(key)) missing.push(`${label}: ${locale} has extra key ${key}`);
  }
  for (const [locale, entries] of localeObjects) {
    for (const [key, value] of entries) if (value === null) empty.push(`${sourceFile}: ${locale}.${key} is not a plain string`);
  }
}

compareSets("shared dictionary", "src/lib/i18n/dictionaries", localeNames.map((locale) => [locale, dictionarySources.get(locale)]));

for (const [label, file] of [["page copy", "src/lib/i18n/page-copy.ts"], ["route copy", "src/lib/i18n/route-copy.ts"]]) {
  const absolute = join(root, file);
  const text = await readFile(absolute, "utf8");
  const source = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const copy = objectForVariable(source, "copy");
  const localeObjects = [];
  for (const property of copy?.properties ?? []) {
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name) || !ts.isObjectLiteralExpression(unwrap(property.initializer))) continue;
    const locale = property.name.text;
    const entries = propertyMap(unwrap(property.initializer), file);
    localeObjects.push([locale, entries]);
  }
  const english = localeObjects.find(([locale]) => locale === "en")?.[1];
  if (english) compareSets(label, file, [
    ["en", english],
    ["fr", localeObjects.find(([locale]) => locale === "fr")?.[1] ?? new Map()],
    ["ar", localeObjects.find(([locale]) => locale === "ar")?.[1] ?? new Map()],
  ]);
}

const sourceFiles = await walk(sourceRoot);
const sourceTexts = [];
for (const file of sourceFiles) {
  const relativeFile = relative(root, file).replaceAll("\\", "/");
  if (ignoredFiles.has(relativeFile)) continue;
  const text = await readFile(file, "utf8");
  sourceTexts.push(text);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (node) => {
    if (ts.isJsxText(node)) addLiteral(source, relativeFile, node, node.text, "JSX text");
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && visibleAttributes.has(node.name.getText(source))) {
      addLiteral(source, relativeFile, node, node.initializer.text, node.name.getText(source));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

const joinedSource = sourceTexts.join("\n");
for (const [locale, entries] of dictionarySources) {
  for (const key of entries.keys()) {
    if (!joinedSource.includes(`"${key}"`) && !joinedSource.includes(`'${key}'`) && !(key.startsWith("locale.") && joinedSource.includes("locale.${item}"))) {
      unused.push(`${locale}.${key}`);
    }
  }
}

console.log(`Dictionary keys: ${dictionarySources.get("en").size} shared; ${dictionarySources.get("fr").size} FR; ${dictionarySources.get("ar").size} AR.`);
console.log(`Key parity issues: ${missing.length}; duplicate keys: ${duplicate.length}; empty/non-string values: ${empty.length}.`);
if (missing.length || duplicate.length || empty.length) console.log([...missing, ...duplicate, ...empty].join("\n"));
console.log(`Potential hardcoded visible English strings: ${hardcoded.length} (heuristic candidates; includes names, quotes and data labels).`);
if (hardcoded.length) console.log(hardcoded.slice(0, 25).join("\n"));
if (hardcoded.length > 25) console.log(`… and ${hardcoded.length - 25} more candidates.`);
const uniqueUnusedEnglish = [...new Set(unused.filter((key) => key.startsWith("en.")))];
if (uniqueUnusedEnglish.length) console.log(`Potential unused English keys: ${uniqueUnusedEnglish.length} (dynamic keys may be false positives); sample: ${uniqueUnusedEnglish.slice(0, 12).join(", ")}`);
if (missing.length || duplicate.length || empty.length) process.exitCode = 1;
