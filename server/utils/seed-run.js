import { connectToDb, seedData } from "./seed.js";

connectToDb()
  .then(() => seedData())
  .catch((error) => {
    console.error("Seed runner failed:", error);
    process.exit(1);
  });
