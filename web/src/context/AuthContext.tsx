import { createContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import {
  aesEncrypt,
  encryptAESKeyWithRSA,
  generateAESKeyIV,
  getRSAKey,
} from "../utils";
import { API_ENDPOINT } from "../constatnts";

interface AuthContextType {
  encryptAndSendData: (message: string) => Promise<void>;
  publicRSAKey: CryptoKey | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicRSAKey, setPublicRSAKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    getRSAKey().then((key) => setPublicRSAKey(key));
  }, []);

  async function encryptAndSendData(message: string) {
    if (!publicRSAKey) return;

    // Generate AES key and IV
    const { aesKey, iv } = await generateAESKeyIV();

    // Encrypt the data using AES
    const encryptedMessage = aesEncrypt(message, aesKey, iv);

    // Encrypt the AES key using the RSA public key
    const encryptedAESKey = await encryptAESKeyWithRSA(aesKey, publicRSAKey);

    // Send encrypted AES key, IV, and encrypted message to server
    const res = await fetch(`${API_ENDPOINT}/decrypt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encryptedAESKey: encryptedAESKey,
        iv: iv.toString(CryptoJS.enc.Base64),
        encryptedMessage: encryptedMessage,
      }),
    });

    const data = await res.json();
    console.log(data);
  }

  return (
    <AuthContext.Provider
      value={{
        encryptAndSendData,
        publicRSAKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
