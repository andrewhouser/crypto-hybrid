import fs from "fs";
import crypto from "crypto";

export const generateKeys = async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  fs.writeFileSync("keys/public.pem", publicKey);
  fs.writeFileSync("keys/private.pem", privateKey);
};

generateKeys();
