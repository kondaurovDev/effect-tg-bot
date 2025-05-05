import { readFileSync } from "fs";

import * as cred from "./config.json";

const url = "https://gwdwamkhk9.execute-api.eu-west-1.amazonaws.com/api/run-bot";

const params = new URLSearchParams({
  name: "effect-bot",
  token: cred.bot_token
});

const code = readFileSync("./dist/bot.js")

fetch(`${url}?${params.toString()}`, {
  method: "POST",
  body: code,
  headers: {
    auth: cred.platform_token
  }
}).then(async (res) => {
  console.log("Success", JSON.stringify(await res.json(), undefined, 2))
}).finally(() => {
  console.log("Done deploying")
});
