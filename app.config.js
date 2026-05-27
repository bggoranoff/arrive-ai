require("dotenv").config();

const appJson = require("./app.json");

module.exports = ({ config }) => ({
  ...appJson.expo,
  ...config,
  extra: {
    lyceumApiKey: process.env.LYCEUM_API_KEY || "",
    lyceumBaseUrl:
      process.env.LYCEUM_BASE_URL || "https://api.lyceum.technology",
    lyceumModel:
      process.env.LYCEUM_MODEL || "Qwen/Qwen2.5-VL-72B-Instruct",
  },
});
