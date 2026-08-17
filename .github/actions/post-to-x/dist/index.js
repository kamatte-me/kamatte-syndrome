// src/index.ts
import { createHmac, randomBytes } from "node:crypto";
var DeliveryResponseError = class extends Error {
};
async function publishTextToX(text, options) {
  const postText = text.trim();
  if (postText === "") {
    throw new Error("X text must not be empty.");
  }
  const url = "https://api.x.com/2/tweets";
  try {
    const response = await (options.fetchFn ?? fetch)(url, {
      body: JSON.stringify({ text: postText }),
      headers: {
        Authorization: createOAuthAuthorizationHeader(
          "POST",
          url,
          options.credentials
        ),
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    if (!response.ok) {
      throw new DeliveryResponseError(
        `X delivery failed with HTTP ${response.status}.`
      );
    }
  } catch (error) {
    if (error instanceof DeliveryResponseError) {
      throw error;
    }
    throw new Error(
      `X delivery has an unknown outcome and will not be retried automatically: ${toErrorMessage(error)}`
    );
  }
}
function createOAuthAuthorizationHeader(method, url, credentials) {
  const oauthParameters = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1e3)),
    oauth_token: credentials.accessToken,
    oauth_version: "1.0"
  };
  const target = new URL(url);
  const parameters = [
    ...target.searchParams.entries(),
    ...Object.entries(oauthParameters)
  ].map(([key, value]) => [oauthEncode(key), oauthEncode(value)]).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    const keyOrder = leftKey.localeCompare(rightKey);
    return keyOrder === 0 ? leftValue.localeCompare(rightValue) : keyOrder;
  });
  const baseUrl = `${target.protocol}//${target.host}${target.pathname}`;
  const parameterString = parameters.map(([key, value]) => `${key}=${value}`).join("&");
  const signatureBase = [
    method.toUpperCase(),
    oauthEncode(baseUrl),
    oauthEncode(parameterString)
  ].join("&");
  const signingKey = `${oauthEncode(credentials.consumerSecret)}&${oauthEncode(credentials.accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey).update(signatureBase).digest("base64");
  const headerParameters = {
    ...oauthParameters,
    oauth_signature: signature
  };
  return `OAuth ${Object.entries(headerParameters).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${oauthEncode(key)}="${oauthEncode(value)}"`).join(", ")}`;
}
function oauthEncode(value) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.codePointAt(0)?.toString(16).toUpperCase()}`
  );
}
function getInput(name) {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll(" ", "_")}`];
  if (value === void 0 || value.trim() === "") {
    throw new Error(`Missing required input: ${name}`);
  }
  return value.trim();
}
function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
async function main() {
  await publishTextToX(getInput("text"), {
    credentials: {
      accessToken: getInput("access-token"),
      accessTokenSecret: getInput("access-token-secret"),
      consumerKey: getInput("consumer-key"),
      consumerSecret: getInput("consumer-secret")
    }
  });
}
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
export {
  getInput,
  publishTextToX
};
