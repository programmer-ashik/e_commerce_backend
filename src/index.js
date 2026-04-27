import { configDotenv } from "dotenv";
import connectDb from "./db/connectDb.js";
import { app } from "./app.js";
// initialize dotenv
configDotenv({ path: "./.env" });
// connectdb
connectDb()
  .then(() => {
    const port = process.env.PORT || 8000;
    const server = app.listen(port, () => {
      console.log(`Server is Runingﮩ٨ـon port:${port} ▄︻デ══━一💥`);
    });
    server.on("error", (error) => {
      console.log("Error", { error });
    });
  })
  .catch((error) => {
    console.log("Mongodb Connecting failed");
  });
