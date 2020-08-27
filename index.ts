#!/usr/bin/env node

import fetch from "node-fetch";
import { execFile } from "promisify-child-process";

const CLIENT_ID = "7575f056cd20be33b5e0";

type CodeRequest = {
  scope: string;
  client_id: string;
};
type CodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
};
async function getCode(body: CodeRequest): Promise<CodeResponse> {
  let resp = await fetch("https://github.com/login/device/code", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  if (resp.status !== 200) {
    throw new Error(
      `getCode: HTTP ${resp.status} from Github ${await resp.text()}`
    );
  }

  return resp.json();
}

type TokenRequest = {
  client_id: string;
  device_code: string;
  grant_type: string;
};
type ErrorResponse = {
  error:
    | "authorization_pending"
    | "slow_down"
    | "expired_token"
    | "unsupported_grant_type"
    | "incorrect_client_credentials"
    | "incorrect_device_code"
    | "access_denied";
  error_description: string;
  error_uri: string;
};
type TokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};
async function getToken(
  body: TokenRequest
): Promise<TokenResponse | ErrorResponse> {
  let resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  if (resp.status !== 200) {
    throw new Error(
      `getToken: HTTP ${resp.status} from Github ${await resp.text()}`
    );
  }

  return resp.json();
}

async function sleep(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

(async function getAccessToken() {
  console.log("Requesting login parameters...");

  try {
    await execFile(
      "npm",
      ["whoami", "--registry", "https://npm.pkg.github.com/"],
      { cwd: process.env.HOME }
    );
    console.log("You are already authenticated!");
    return;
  } catch (e) {}

  let { device_code, user_code, verification_uri, interval } = await getCode({
    scope: "write:packages read:packages delete:packages repo",
    client_id: CLIENT_ID,
  });

  console.log("Please sign in at " + verification_uri);
  console.log("  and enter code: " + user_code);

  await sleep(interval * 1000);
  console.log("waiting for Github...");

  let access_token: string = "";

  while (true) {
    let resp = await getToken({
      client_id: CLIENT_ID,
      device_code: device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });

    if ("error" in resp) {
      if (resp.error === "authorization_pending") {
        await sleep(interval * 1000);
        continue;
      } else {
        console.log(resp.error + ": " + resp.error_description);
        process.exit(1);
      }
    }

    access_token = resp.access_token;
    break;
  }

  await execFile(
    "npm",
    ["config", "set", "//npm.pkg.github.com/:_authToken", access_token],
    { cwd: process.env.HOME }
  );

  console.log("Success!");
})();
