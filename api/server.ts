import cors from "cors";
import express from "express";
import nocache from "nocache";
import fs from "fs";

import { privateDecrypt, createDecipheriv } from "crypto";

const app = express();
const port = 8085;

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200, // Some legacy browsers choke on status 204, so use 200
};

app.use(cors());
app.use(nocache());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("etag", false);

const PRIVATE_KEY = "keys/private.pem";
const PUBLIC_KEY = "keys/public.pem";

/// BEGIN API ENDPOINTS
app.post("/api/decrypt", async (req, res) => {
  const { encryptedAESKey, iv, encryptedMessage } = req.body;
  const privateKey = fs.readFileSync(PRIVATE_KEY, "utf8");

  try {
    // Decrypt the AES key with the server's private RSA key
    const aesKeyBuffer = privateDecrypt(
      {
        key: privateKey,
        passphrase: "", // If applicable
        padding: require("crypto").constants.RSA_PKCS1_OAEP_PADDING, // Ensure OAEP padding
        oaepHash: "sha256", // Match with client-side hash
      },
      Buffer.from(encryptedAESKey, "base64")
    );

    const aesKey = aesKeyBuffer.toString(); // Get AES key as a string

    // Decrypt the message using AES (as in your previous code)
    const decipher = createDecipheriv(
      "aes-256-cbc",
      Buffer.from(aesKey, "base64"), // Make sure the AES key is correctly formatted
      Buffer.from(iv, "base64")
    );

    let decrypted = decipher.update(encryptedMessage, "base64", "utf8");
    decrypted += decipher.final("utf8");

    res.json({ decryptedMessage: decrypted });
  } catch (err) {
    console.error("Decryption error:", err);
    res.status(500).json({ error: "Decryption failed" });
  }
});

app.get("/api/public_key", cors(corsOptions), (req, res) => {
  let publicKey = fs.readFileSync(PUBLIC_KEY, "utf8");
  publicKey = publicKey.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  res.json({ publicKey });
});

/// END API ENDPOINTS

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
