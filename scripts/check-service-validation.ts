import assert from "node:assert/strict";
import { serviceSchema } from "../src/lib/validation/service";

const validService = {
  name: "  CloudPlay Games  ",
  provider: "  PixelForge Studio  ",
  category: "Games",
  description: "Play games on your phone.",
  operator: "Cedar Mobile",
  price: "4.99",
  cycle: "Weekly",
  trialDays: "3",
  keyword: "PLAY",
  shortcode: "0123",
  notificationUrl: "https://example.com/notify",
  sendWelcomeSms: true,
  status: "Active",
};

const parsed = serviceSchema.parse(validService);

assert.equal(parsed.name, "CloudPlay Games");
assert.equal(parsed.provider, "PixelForge Studio");
assert.equal(parsed.price, 4.99);
assert.equal(parsed.trialDays, 3);
assert.equal(parsed.shortcode, "0123");

console.log("PASS: valid data, trimming, and number conversion");

const invalidCases: {
  label: string;
  field: string;
  changes: Record<string, unknown>;
  expectedMessage?: string;
}[] = [
  {
    label: "Blank service name",
    field: "name",
    changes: { name: "   " },
    expectedMessage: "Enter a service name.",
  },
  {
    label: "Blank provider",
    field: "provider",
    changes: { provider: "" },
    expectedMessage: "Enter the content provider.",
  },
  {
    label: "Description over 120 characters",
    field: "description",
    changes: { description: "a".repeat(121) },
    expectedMessage: "Max 120 characters.",
  },
  {
    label: "Zero price",
    field: "price",
    changes: { price: 0 },
    expectedMessage: "Price must be greater than 0.",
  },
  {
    label: "Price above 50",
    field: "price",
    changes: { price: 50.01 },
    expectedMessage: "Price can’t be more than $50.",
  },
  {
    label: "Non-numeric price",
    field: "price",
    changes: { price: "abc" },
    expectedMessage: "Enter a price.",
  },
  {
    label: "Unsupported trial length",
    field: "trialDays",
    changes: { trialDays: 2 },
  },
  {
    label: "Lowercase keyword",
    field: "keyword",
    changes: { keyword: "play" },
    expectedMessage: "Use 2–10 capital letters, e.g. PLAY.",
  },
  {
    label: "Shortcode containing letters",
    field: "shortcode",
    changes: { shortcode: "12AB" },
    expectedMessage: "Use 3–6 digits, e.g. 1234.",
  },
  {
    label: "HTTP notification URL",
    field: "notificationUrl",
    changes: { notificationUrl: "http://example.com/notify" },
    expectedMessage: "Enter a URL that starts with https://",
  },
  {
    label: "Invalid notification URL",
    field: "notificationUrl",
    changes: { notificationUrl: "not-a-url" },
    expectedMessage: "Enter a valid URL.",
  },
  {
    label: "Unsupported category",
    field: "category",
    changes: { category: "Music" },
  },
  {
    label: "Unsupported operator",
    field: "operator",
    changes: { operator: "Unknown operator" },
  },
  {
    label: "Unsupported cycle",
    field: "cycle",
    changes: { cycle: "Yearly" },
  },
  {
    label: "Unsupported status",
    field: "status",
    changes: { status: "Draft" },
  },
  {
    label: "Non-boolean welcome SMS value",
    field: "sendWelcomeSms",
    changes: { sendWelcomeSms: "true" },
  },
];

for (const testCase of invalidCases) {
  const result = serviceSchema.safeParse({
    ...validService,
    ...testCase.changes,
  });

  if (result.success) {
    throw new Error(`FAIL: ${testCase.label} was accepted.`);
  }

  const issue = result.error.issues.find(
    (item) => item.path[0] === testCase.field,
  );

  assert.ok(issue, `Missing error for ${testCase.field}`);

  if (testCase.expectedMessage) {
    assert.equal(issue.message, testCase.expectedMessage);
  }

  console.log(`PASS: ${testCase.label}`);
}

for (const trialDays of [0, 1, 3, 7]) {
  serviceSchema.parse({ ...validService, trialDays });
}

serviceSchema.parse({
  ...validService,
  price: 50,
  description: "a".repeat(120),
});

serviceSchema.parse({
  ...validService,
  description: undefined,
});

console.log("PASS: allowed trial lengths and valid boundaries");
console.log("All service validation checks passed.");