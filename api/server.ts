import cors from "cors";
import express from "express";
import nocache from "nocache";
import fs from "fs";
import { privateDecrypt, createDecipheriv } from "crypto";

// Initialize Express app and set port
const app = express();
const port = 8085;

// CORS options
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200, // Some legacy browsers choke on status 204, so use 200
};

// Middleware
app.use(cors());
app.use(nocache());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("etag", false);

// Define paths for RSA key files
const PRIVATE_KEY = "keys/private.pem";
const PUBLIC_KEY = "keys/public.pem";

/// BEGIN API ENDPOINTS

// Decryption endpoint
app.post("/api/decrypt", async (req, res) => {
  // Extract encrypted data from request body
  const { encryptedAESKey, iv, encryptedMessage } = req.body;
  const privateKey = fs.readFileSync(PRIVATE_KEY, "utf8");

  try {
    // Step 1: Decrypt the AES key using RSA private key
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

    // Step 2: Decrypt the message using AES
    const decipher = createDecipheriv(
      "aes-256-cbc",
      Buffer.from(aesKey, "base64"), // Make sure the AES key is correctly formatted
      Buffer.from(iv, "base64")
    );

    let decrypted = decipher.update(encryptedMessage, "base64", "utf8");
    decrypted += decipher.final("utf8");

    // Send decrypted message back to client
    res.json({ decryptedMessage: decrypted });
  } catch (err) {
    console.error("Decryption error:", err);
    res.status(500).json({ error: "Decryption failed" });
  }
});

// Public key retrieval endpoint
app.get("/api/public_key", cors(corsOptions), (req, res) => {
  // Read and format public key
  let publicKey = fs.readFileSync(PUBLIC_KEY, "utf8");
  publicKey = publicKey.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  res.json({ publicKey });
});

/// END API ENDPOINTS

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
