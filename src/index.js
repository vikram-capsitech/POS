import { config } from "dotenv";
import httpServer from "./app.js";
import connectDb from "./Db/index.js";
config({ path: "./.env" });

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    console.info(
      `📑 Visit the documentation at: http://localhost:${
        process.env.PORT || 8080
      }`
    );
    console.log("⚙️  Server is running on port: " + process.env.PORT);
  });
};

connectDb();
startServer();
