const status = require("./sdk.js");

let STATUS_CLIENT;

async function createClient() {
  const client = await status.createRequestClient({
    environment: "production",
  });
  STATUS_CLIENT = client;
  return client;
}

async function fetchUser(pubkey) {
  if (!STATUS_CLIENT) await createClient();
  return await STATUS_CLIENT.fetchUser(pubkey);
}

module.exports = { createClient, fetchUser };
