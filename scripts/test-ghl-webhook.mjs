// Quick GHL webhook smoke test
// Run: node scripts/test-ghl-webhook.mjs

const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/f5ehsbHfdFg2UsHEIb49/webhook-trigger/4692d346-311e-4561-8bc6-5e23f4e1fa5f";

const testPayload = {
  first_name: "Test User",
  email: "nimmi24.1990@gmail.com",
  total_score: 6,
  percent_ready: 25,
  band: "AT RISK",
  weakest_domain: "Digital",
  second_weakest_domain: "Legal",
  digital_score: 0,
  legal_score: 2,
  financial_score: 2,
  physical_score: 2,
  day_1_action_title: "Set up Legacy Contact on your phone (iPhone or Android)",
  day_2_action_title: "Identify Primary, Secondary, Tertiary for Executor",
  day_3_action_title: "Verify beneficiaries on one retirement account",
  day_4_action_title: "Decide burial vs cremation. Write it.",
  day_5_action_title: "Install a password manager and add your top 5 accounts",
  day_6_action_title: "Status-check your estate documents",
  day_7_action_title: "Tell your Know/Love/Trust person where every list lives.",
  source: "Q12_MOBILE_TEST",
  consent_marketing: true,
  platform: "web",
  tags: ["mobile_app_user", "q12_completed", "test_fire"],
};

console.log("Firing GHL webhook...");
console.log("URL:", WEBHOOK_URL);
console.log("Payload:", JSON.stringify(testPayload, null, 2));

try {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPayload),
  });

  const text = await res.text();
  if (res.ok) {
    console.log("\n✅ Webhook fired successfully!");
    console.log("Status:", res.status);
    console.log("Response:", text || "(empty body — normal for GHL)");
    console.log("\nCheck GHL contacts for: nimmi24.1990@gmail.com");
  } else {
    console.log("\n❌ Webhook failed");
    console.log("Status:", res.status);
    console.log("Response:", text);
  }
} catch (err) {
  console.error("\n❌ Network error:", err.message);
}
