const { analyzeMoodRisk } = require("./moodRisk");

async function main() {
  const text = process.argv.slice(2).join(" ") || "I feel overwhelmed and cannot focus.";

  const result = await analyzeMoodRisk(text);
  console.log(result);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
