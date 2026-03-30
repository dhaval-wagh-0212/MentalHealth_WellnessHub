require("dotenv").config();
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectDB();
  const app = require("./app");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
