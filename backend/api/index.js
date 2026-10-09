import "dotenv/config";
import app from "../src/app.js";
import connectDB from "../src/config/db.js";

let connected = false;

export default async function handler(req, res) {
  if (!connected) {
    await connectDB();
    connected = true;
  }
  return app(req, res);
}