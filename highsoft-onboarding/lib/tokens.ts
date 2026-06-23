import crypto from "crypto";

export function gerarTokenCliente() {
  return crypto.randomBytes(32).toString("base64url");
}
