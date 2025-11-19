// storage.ts

const isServer = typeof window === "undefined";

if (isServer) {
  // IMPORTA SERVER
  const server = require("./storage.server.ts");
  module.exports = server;
} else {
  // IMPORTA CLIENT
  const client = require("./storage.client.ts");
  module.exports = client;
}
