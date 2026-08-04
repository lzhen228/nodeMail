import { DAILY_SEND_CRON, getAllDataAndSendMail } from "../netlify/functions/main.js";

function assertRequiredEnv() {
  const requiredEnv = [
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
    "EMAIL_TO",
    "QWEATHER_API_HOST",
    "QWEATHER_PRIVATE_KEY",
    "QWEATHER_KEY_ID",
    "QWEATHER_PROJECT_ID",
  ];

  const missing = requiredEnv.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

if (process.argv.includes("--send-now")) {
  const result = await getAllDataAndSendMail();
  console.log(result.body);
  process.exitCode = result.statusCode >= 400 ? 1 : 0;
} else {
  assertRequiredEnv();
  console.log(`Netlify scheduled function is configured with cron: ${DAILY_SEND_CRON}`);
  console.log("Netlify uses UTC time. This cron runs at Beijing time 05:20.");
  console.log("Run `pnpm send` if you want to send one email immediately for testing.");
}
