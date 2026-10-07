import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import ts from "typescript";
const copyKeys = /(?:title|heading|label|name|description|lead|body|answer|question|tagline|eyebrow|summary|details|content|caption|placeholder|subtitle|alt|text|copy|intro|mission|vision|statement|rule|condition|benefit|feature|disclaimer|note|step|requirement|policy|definition|example|value|cta|quote|faq)(?:s|label|text)?$/iu;
const copyVariables = /(?:content|copy|text|faq|benefit|feature|rule|condition|instrument|market|platform|product|account|payment|legal|education|terms|section|paragraph|step|question|answer|quote|stat|metric|description|navigation|footer)/iu;
const copyAttributes = new Set(["aria-label", "placeholder", "title", "alt", "label", "description"]);
const numericPattern = /(?:\b1\s*:\s*\d{1,4}\b|\$\s?\d[\d,.]*(?:\s?(?:USD|EUR|GBP|per\s+lot|\/month))?|\b\d+(?:[.,]\d+)?\s?(?:%|pips?|points?|lots?|days?|hours?|minutes?|business\s+days?|weeks?|months?|to\s+\d+\s*(?:hours?|days?))\b|\b\d+\s+(?:trading\s+days?|accounts?|instruments?|platforms?|markets?)\b)/giu;
const root = process.cwd();
const sourceRoot = join(root, "src");
const knowledgeRoot = join(root, "knowledge");
const files = await collect(sourceRoot);
const sourceTexts = new Map();
for (const file of files)
    sourceTexts.set(file, await readFile(file, "utf8"));
const dictionaries = Object.fromEntries(["en", "fr", "ar"].map((locale) => {
    const file = join(sourceRoot, "lib", "i18n", "dictionaries", `${locale}.ts`);
    return [locale, sourceTexts.has(file) ? extractDictionary(sourceTexts.get(file), file) : new Map()];
}));
const pages = files.filter((file) => /(?:^|[\\/])page\.[jt]sx?$/.test(file));
const generated = [];
const hashes = {};
const routeCoverage = [];
for (const page of pages) {
    const route = routeFor(page);
    // Portal and admin surfaces can contain private visitor or operational data.
    // Exclude them before traversing their dependencies so none of their copy
    // enters the public assistant corpus.
    if (route === "/admin" || route.startsWith("/admin/") || route === "/portal" || route.startsWith("/portal/")) {
        routeCoverage.push({ route, status: "excluded", reason: route === "/portal" || route.startsWith("/portal/") ? "private portal route" : "admin-only route" });
        continue;
    }
    const reachable = dependencyGraph(page, sourceTexts, ancestorLayouts(page));
    const chunks = [];
    const localizedChunks = { en: [], fr: [], ar: [] };
    const headings = [];
    for (const file of reachable) {
        const source = sourceTexts.get(file);
        hashes[toProjectPath(file)] = sha(source);
        const extracted = extractContent(source, file);
        chunks.push(...extracted.content);
        headings.push(...extracted.headings);
    }
    const uniqueContent = [...new Set(chunks)];
    const content = uniqueContent.join("\n");
    if (content.length < 40) {
        routeCoverage.push({ route, status: "not_indexed", reason: "no extractable visitor-facing copy", sourceFiles: reachable.map(toProjectPath) });
        continue;
    }
    const translationRefs = collectTranslationKeys(reachable, sourceTexts);
    for (const locale of ["en", "fr", "ar"])
        localizedChunks[locale].push(...dictionaryText(dictionaries[locale], translationRefs));
    const title = titleFor(route, headings);
    const parent = route === "/" ? null : `/${route.split("/").filter(Boolean).slice(0, -1).join("/")}` || "/";
    const contentByLocale = Object.fromEntries(["en", "fr", "ar"].map((locale) => [
        locale,
        [...new Set([...uniqueContent, ...localizedChunks[locale]])].join("\n"),
    ]));
    generated.push({
        id: `website:${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}`,
        origin: "generated",
        category: categoryFor(route),
        title,
        keywords: { en: [], fr: [], ar: [] },
        content,
        contentByLocale,
        summary: {
            en: contentByLocale.en.slice(0, 600),
            fr: contentByLocale.fr.slice(0, 600),
            ar: contentByLocale.ar.slice(0, 600),
        },
        sourceRoutes: [route],
        sourceFiles: reachable.map(toProjectPath),
        parentPage: parent,
        sections: [...new Set(headings)].slice(0, 80),
        relatedIds: [],
        contentVersion: sha(content),
    });
    routeCoverage.push({ route, status: "indexed", sourceFiles: reachable.map(toProjectPath), sections: [...new Set(headings)].length, characters: content.length });
}
const curatedRaw = JSON.parse(await readFile(join(knowledgeRoot, "index.json"), "utf8"));
const curated = (curatedRaw.documents ?? []).filter((doc) => doc.origin !== "generated");
for (const doc of curated)
    doc.origin = "curated";
const documents = [...curated, ...generated];
const curatedGraph = {
    "funded-evaluation-accounts": ["registration", "verification-payouts", "faq-trading-conditions"],
    "live-broker-accounts": ["markets-instruments", "platforms", "faq-trading-conditions"],
    "markets-instruments": ["live-broker-accounts", "platforms", "faq-trading-conditions"],
    platforms: ["live-broker-accounts", "markets-instruments"],
    payments: ["registration", "verification-payouts"],
    "verification-payouts": ["payments", "funded-evaluation-accounts"],
    "faq-trading-conditions": ["funded-evaluation-accounts", "live-broker-accounts", "markets-instruments"],
    registration: ["funded-evaluation-accounts", "payments"],
    "company-contact": ["registration", "payments"],
};
for (const document of curated)
    document.relatedIds = [...new Set([...(document.relatedIds ?? []), ...(curatedGraph[document.id] ?? [])])].filter((id) => documents.some((item) => item.id === id));
for (const doc of documents) {
    if (doc.origin === "generated")
        doc.relatedIds = documents
            .filter((other) => other.id !== doc.id && other.sourceRoutes.some((route) => route.startsWith(doc.sourceRoutes[0] === "/" ? "/" : `${doc.sourceRoutes[0]}/`) || doc.sourceRoutes[0].startsWith(`${route}/`)))
            .map((other) => other.id).slice(0, 12);
}
await writeFile(join(knowledgeRoot, "index.json"), `${JSON.stringify({ documents }, null, 2)}\n`);
const manifest = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    sourceCount: Object.keys(hashes).length,
    pageCount: generated.length,
    documentCount: documents.length,
    hashes,
    documentHashes: Object.fromEntries(documents.map((doc) => [doc.id, sha(doc.content)])),
};
await writeFile(join(knowledgeRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
const coverage = buildCoverageReport({ pages, routeCoverage, generated, documents, hashes, manifest });
await writeFile(join(knowledgeRoot, "coverage-report.json"), `${JSON.stringify(coverage, null, 2)}\n`);
await writeFile(join(knowledgeRoot, "coverage-report.md"), renderCoverageReport(coverage));
console.log(`Indexed ${generated.length} public pages into generated records (${documents.length} total records); wrote knowledge/coverage-report.md.`);
async function collect(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory())
            return collect(path);
        return /\.[jt]sx?$/.test(entry.name) && !/\.d\.ts$/.test(entry.name) ? [path] : [];
    }));
    return nested.flat();
}
function sha(value) { return createHash("sha256").update(value).digest("hex"); }
function toProjectPath(file) { return relative(root, file).split(sep).join("/"); }
function routeFor(page) {
    let path = relative(join(sourceRoot, "app"), page).split(sep).join("/").replace(/\/page\.[jt]sx?$/, "");
    path = path.replace(/\([^/]+\)\/?/g, "").replace(/\[\.\.\.([^\]]+)\]/g, ":$1*").replace(/\[([^\]]+)\]/g, ":$1");
    return `/${path}`.replace(/\/$/, "") || "/";
}
function dependencyGraph(entry, texts, extraEntries = []) {
    const visited = new Set();
    const queue = [entry, ...extraEntries];
    while (queue.length) {
        const file = queue.shift();
        if (visited.has(file))
            continue;
        visited.add(file);
        const source = texts.get(file);
        if (!source)
            continue;
        const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
        for (const statement of ast.statements) {
            if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
                continue;
            const spec = statement.moduleSpecifier.text;
            const base = spec.startsWith("@/") ? join(sourceRoot, spec.slice(2)) : spec.startsWith(".") ? resolve(join(file, ".."), spec) : "";
            if (!base)
                continue;
            for (const candidate of [base, ...[".tsx", ".ts", ".jsx", ".js"].map((ext) => `${base}${ext}`), ...["index.tsx", "index.ts", "index.jsx", "index.js"].map((name) => join(base, name))]) {
                if (texts.has(candidate) && indexableSource(candidate) && !visited.has(candidate))
                    queue.push(candidate);
            }
        }
    }
    return [...visited];
}
function indexableSource(file) {
    const path = file.split(sep).join("/");
    return path.includes("/src/app/") || path.includes("/src/components/") || /\/src\/lib\/(content\.ts|site\.ts|products\.ts|landing\/|i18n\/dictionaries\/|cms\/defaults\/)/.test(path);
}
function ancestorLayouts(page) {
    const appRoot = join(sourceRoot, "app");
    const relativeDir = relative(appRoot, join(page, ".."));
    const folders = relativeDir.split(sep).filter(Boolean);
    const paths = [appRoot];
    for (let i = 1; i <= folders.length; i++)
        paths.push(join(appRoot, ...folders.slice(0, i)));
    return paths.flatMap((folder) => [join(folder, "layout.tsx"), join(folder, "layout.ts"), join(folder, "layout.jsx"), join(folder, "layout.js")]).filter((file) => sourceTexts.has(file));
}
function extractContent(text, filename) {
    const ast = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, filename.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const values = [];
    const headings = [];
    if (/[\\/]dictionaries[\\/](en|fr|ar)\.[jt]sx?$/.test(filename))
        return { content: values, headings };
    const add = (raw) => {
        const value = raw.replace(/\s+/g, " ").trim();
        if (value.length >= 3 && /[\p{L}\p{N}]{2}/u.test(value) && !/^https?:\/\//i.test(value) && !looksLikeUtilityClassList(value))
            values.push(value);
    };
    const walk = (node) => {
        if (ts.isJsxText(node))
            add(node.text);
        if (ts.isStringLiteralLike(node)) {
            if (isVisitorCopyLiteral(node, ast)) {
                add(node.text);
                const key = propertyKeyFor(node);
                if (["title", "heading"].includes(key) && node.text.trim().length >= 3) headings.push(node.text.trim());
            }
        }
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            const tag = node.tagName.getText(ast);
            if (/^h[1-6]$/.test(tag)) {
                const jsx = node.parent;
                const heading = ts.isJsxElement(jsx) ? jsx.children.map(jsxText).join(" ").replace(/\s+/g, " ").trim() : "";
                if (heading) {
                    add(heading);
                    headings.push(heading);
                }
            }
        }
        ts.forEachChild(node, walk);
    };
    walk(ast);
    return { content: values, headings };
}
function jsxText(node) {
    if (ts.isJsxText(node)) return node.text;
    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression)) return node.expression.text;
    if (ts.isJsxElement(node)) return node.children.map(jsxText).join(" ");
    return "";
}
function titleFor(route, headings) { return headings[0]?.slice(0, 120) || route.split("/").filter(Boolean).at(-1)?.replace(/[-:]/g, " ") || "Home"; }
function categoryFor(route) { return route.split("/").filter(Boolean)[0] || "home"; }

function propertyKeyFor(node) {
    const parent = node.parent;
    return ts.isPropertyAssignment(parent) && (ts.isIdentifier(parent.name) || ts.isStringLiteral(parent.name))
        ? parent.name.text.toLowerCase()
        : "";
}

function isVisitorCopyLiteral(node, ast) {
    let parent = node.parent;
    if (ts.isJsxAttribute(parent)) {
        const name = parent.name.getText(ast).toLowerCase();
        return copyAttributes.has(name);
    }
    if (ts.isPropertyAssignment(parent)) return copyKeys.test(propertyKeyFor(node));

    // Capture literal text rendered inside conditional JSX such as {ready ? "Open" : "Close"},
    // while avoiding implementation strings passed into helper functions.
    let cursor = parent;
    while (cursor && !ts.isJsxExpression(cursor)) {
        if (ts.isCallExpression(cursor) || ts.isJsxAttribute(cursor)) break;
        cursor = cursor.parent;
    }
    if (cursor && ts.isJsxExpression(cursor)) return true;

    // Copy arrays are common for package benefits, steps, FAQs, and market descriptions.
    cursor = parent;
    while (cursor) {
        if (ts.isPropertyAssignment(cursor)) return copyKeys.test(propertyKeyFor(cursor.initializer));
        if (ts.isVariableDeclaration(cursor)) {
            const name = cursor.name.getText(ast).toLowerCase();
            return copyVariables.test(name);
        }
        if (ts.isCallExpression(cursor) || ts.isJsxAttribute(cursor)) return false;
        cursor = cursor.parent;
    }
    return false;
}

function looksLikeUtilityClassList(value) {
    const words = value.split(/\s+/u).filter(Boolean);
    if (words.length < 4) return false;
    const utility = /^(?:[a-z0-9-]+:)*(?:-?(?:flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|items-|justify-|content-|gap-|space-|rounded|border|bg-|text-|font-|leading-|tracking-|p-|px-|py-|pt-|pb-|m-|mx-|my-|mt-|mb-|w-|min-w-|max-w-|h-|min-h-|max-h-|size-|overflow-|opacity-|shadow|ring|outline|transition|duration-|ease-|translate-|scale-|rotate-|inset-|top-|bottom-|left-|right-|z-|col-span-|row-span-)).+$/u;
    return words.filter((word) => utility.test(word)).length / words.length > 0.72;
}

function extractDictionary(text, filename) {
    const ast = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const values = new Map();
    const walk = (node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && ts.isObjectLiteralExpression(node.initializer)) {
            for (const property of node.initializer.properties) {
                if (!ts.isPropertyAssignment(property) || !ts.isStringLiteralLike(property.initializer)) continue;
                const key = ts.isStringLiteralLike(property.name) || ts.isIdentifier(property.name) ? property.name.text : "";
                if (key) values.set(key, property.initializer.text);
            }
        }
        ts.forEachChild(node, walk);
    };
    walk(ast);
    return values;
}

function collectTranslationKeys(reachable, texts) {
    const refs = new Set();
    const prefixes = new Set();
    for (const file of reachable) {
        if (/[\\/]dictionaries[\\/](en|fr|ar)\.[jt]sx?$/.test(file)) continue;
        const source = texts.get(file);
        if (!source) continue;
        const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
        const walk = (node) => {
            if (ts.isCallExpression(node)) {
                const called = ts.isIdentifier(node.expression) ? node.expression.text : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : "";
                if (called === "t" && node.arguments[0]) {
                    let key = node.arguments[0];
                    while (ts.isAsExpression(key) || ts.isTypeAssertionExpression(key) || ts.isParenthesizedExpression(key) || ts.isNonNullExpression(key)) key = key.expression;
                    if (ts.isStringLiteralLike(key)) refs.add(key.text);
                    else if (ts.isTemplateExpression(key)) {
                        const prefix = key.head.text;
                        if (prefix) prefixes.add(prefix);
                    }
                }
            }
            ts.forEachChild(node, walk);
        };
        walk(ast);
    }
    return { refs, prefixes };
}

function dictionaryText(dictionary, refs) {
    const selected = [...dictionary].filter(([key]) => refs.refs.has(key) || [...refs.prefixes].some((prefix) => key.startsWith(prefix)));
    return selected.map(([key, value]) => `${key}: ${value}`);
}

function numericFactsFor(document, generatedAt) {
    const facts = [];
    const source = `${document.title}\n${document.content}`;
    for (const match of source.matchAll(numericPattern)) {
        const start = Math.max(0, match.index - 95);
        const end = Math.min(source.length, match.index + match[0].length + 95);
        const originalText = source.slice(start, end).replace(/\s+/gu, " ").trim();
        const section = (document.sections ?? []).find((heading) => originalText.toLocaleLowerCase().includes(heading.toLocaleLowerCase())) ?? document.sections?.[0] ?? document.title;
        facts.push({
            topic: section,
            value: match[0].replace(/\s+/gu, " ").trim(),
            originalText,
            context: originalText,
            category: document.category,
            language: "en",
            sourcePage: document.sourceRoutes?.[0] ?? "/",
            section,
            sourceRoutes: document.sourceRoutes ?? [],
            lastUpdated: generatedAt,
            contentVersion: document.contentVersion ?? sha(document.content ?? ""),
        });
    }
    return facts;
}

function buildCoverageReport({ pages, routeCoverage, generated, documents, hashes, manifest }) {
    const numericFacts = generated.flatMap((document) => numericFactsFor(document, manifest.generatedAt));
    const exactContent = new Map();
    for (const document of documents) {
        const hash = sha((document.content ?? "").replace(/\s+/gu, " ").trim().toLocaleLowerCase());
        if (!hash || !document.content) continue;
        const matches = exactContent.get(hash) ?? [];
        matches.push({ id: document.id, title: document.title, sourceRoutes: document.sourceRoutes ?? [] });
        exactContent.set(hash, matches);
    }
    const duplicates = [...exactContent.values()].filter((group) => group.length > 1);
    const conflictGroups = new Map();
    for (const fact of numericFacts) {
        const context = fact.context.toLocaleLowerCase();
        const label = ["leverage", "spread", "commission", "drawdown", "profit target", "profit split", "price", "fee", "trading days", "payout", "hours"].find((term) => context.includes(term));
        if (!label) continue;
        const key = `${fact.sourceRoutes.join(",")}|${label}`;
        const group = conflictGroups.get(key) ?? new Map();
        const occurrences = group.get(fact.value) ?? [];
        occurrences.push(fact);
        group.set(fact.value, occurrences);
        conflictGroups.set(key, group);
    }
    const conflicts = [...conflictGroups.entries()].flatMap(([key, values]) => values.size > 1
        ? [{ key, values: [...values.entries()].map(([value, occurrences]) => ({ value, occurrences })) }]
        : []);
    const routesFor = (document) => document.sourceRoutes ?? [];
    const recordsFor = (ids, routes) => documents.filter((document) => ids.includes(document.id) || routesFor(document).some((route) => routes.includes(route))).length;
    const indexedRoutes = new Set(generated.flatMap((document) => document.sourceRoutes ?? []));
    return {
        generatedAt: manifest.generatedAt,
        contentVersion: "website-source-v2",
        scope: {
            discoveredPageFiles: pages.length,
            excludedPrivateRoutes: routeCoverage.filter((item) => item.status === "excluded").map(({ route, reason }) => ({ route, reason })),
            indexedRoutes: [...indexedRoutes].sort(),
            routesNotIndexed: routeCoverage.filter((item) => item.status === "not_indexed"),
            indexedSourceFiles: Object.keys(hashes).length,
        },
        counts: {
            pagesScanned: routeCoverage.filter((item) => item.status !== "excluded").length,
            pagesIndexed: generated.length,
            sectionsScanned: generated.reduce((sum, document) => sum + (document.sections?.length ?? 0), 0),
            knowledgeItems: documents.length,
            numericalFacts: numericFacts.length,
            tradingConditionRecords: recordsFor(["faq-trading-conditions"], ["/trading/conditions"]),
            accountConditionRecords: recordsFor(["funded-evaluation-accounts", "live-broker-accounts", "verification-payouts"], ["/trading/accounts", "/register"]),
            faqRecords: recordsFor(["faq-trading-conditions"], ["/faq"]),
            platformRecords: recordsFor(["platforms"], ["/platforms"]),
            instrumentRecords: recordsFor(["markets-instruments"], ["/trade", "/products"]),
            paymentRecords: recordsFor(["payments"], ["/payments"]),
        },
        languageCoverage: Object.fromEntries(["en", "fr", "ar"].map((locale) => [locale, generated.filter((document) => Boolean(document.contentByLocale?.[locale]?.trim())).length])),
        countDefinitions: {
            domainCounts: "Trading-condition, account, FAQ, platform, instrument, and payment counts are source knowledge records, not counts of individual live database entities.",
            numericalFacts: "Occurrences found in generated source-page text. Runtime CMS/database/feed values are reported separately as missing from this build-only count.",
            sectionsScanned: "Distinct heading entries retained per generated route.",
        },
        numericalFacts: numericFacts,
        duplicateCandidates: duplicates,
        conflictingValueCandidates: conflicts,
        missingInformation: [
            "Published FAQs, CMS-managed home/trading copy, active instrument rows, published news, quotes, and calendar entries are dynamic database/feed sources and are loaded by chat at request time; the source-only scan cannot report their live totals.",
            "Live account balances, verification state, payouts, and other visitor-specific portal values are not added to the public chatbot index.",
            ...routeCoverage.filter((item) => item.status === "not_indexed").map(({ route, reason }) => `${route}: ${reason}`),
        ],
        reviewNotes: [
            "Duplicate and conflicting-value groups are review candidates; do not resolve them automatically.",
            "Runtime CMS, published FAQ, instrument, news, economic-calendar, quote, and account data are fetched by the chatbot when the database/feed is available; they are not part of this source-only build scan.",
            "Parameterized routes are indexed as templates. Their live record values depend on the current published database content.",
            "Authentication-only account records and visitor-specific values are intentionally not copied into the public knowledge index.",
        ],
    };
}

function renderCoverageReport(report) {
    const countRows = Object.entries(report.counts).map(([label, value]) => `| ${label.replace(/[A-Z]/gu, (letter) => ` ${letter.toLowerCase()}`)} | ${value} |`).join("\n");
    const indexedRoutes = report.scope.indexedRoutes.map((route) => `- \`${route}\``).join("\n");
    const skipped = report.scope.routesNotIndexed.length
        ? report.scope.routesNotIndexed.map(({ route, reason }) => `- \`${route}\`: ${reason}`).join("\n")
        : "- None.";
    const notes = report.reviewNotes.map((note) => `- ${note}`).join("\n");
    const missing = report.missingInformation.map((item) => `- ${item}`).join("\n");
    return `# Website knowledge coverage report\n\nGenerated: ${report.generatedAt}\nContent version: ${report.contentVersion}\n\n## Coverage counts\n\n| Measure | Count |\n| --- | ---: |\n${countRows}\n\nDomain counts are source record counts, not counts of individual live database entities.\n\n## Indexed routes\n\n${indexedRoutes || "- None."}\n\n## Routes without extractable copy\n\n${skipped}\n\n## Language coverage\n\n| Language | Pages with indexed content |\n| --- | ---: |\n${Object.entries(report.languageCoverage).map(([locale, count]) => `| ${locale.toUpperCase()} | ${count} |`).join("\n")}\n\n## Missing or runtime-only information\n\n${missing}\n\n## Review notes\n\n${notes}\n\nPotential exact duplicates: ${report.duplicateCandidates.length}. Potential numerical conflicts requiring human review: ${report.conflictingValueCandidates.length}. Every numerical value and its source context/version is retained in \`coverage-report.json\`.\n`;
}
