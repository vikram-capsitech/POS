import { config } from "dotenv";
import httpServer from "./app.js";
import connectDb from "./Db/index.js";
config({ path: "./.env" });

connectDb().then(() => {
  console.log("================ STARTUP ENV DUMP ================");
  const safeEnv = { ...process.env };
  // Hide very sensitive keys just in case, but show whether they exist
  [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CLOUDINARY_API_SECRET",
  ].forEach((key) => {
    if (safeEnv[key]) safeEnv[key] = "[HIDDEN_FOR_SECURITY]";
  });
  console.log(safeEnv);
  console.log("==================================================");

  httpServer.listen(process.env.PORT || 8080, () => {
    console.info(
      `📑 Visit the documentation at: http://localhost:${
        process.env.PORT || 8080
      }/api-docs`,
    );
    console.log("⚙️  Server is running on port: " + (process.env.PORT || 8080));
  });
});
