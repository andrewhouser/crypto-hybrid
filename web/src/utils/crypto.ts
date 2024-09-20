/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from "crypto-js";

export const aesEncrypt = (
  data: string,
  aesKey: CryptoJS.lib.WordArray,
  iv: CryptoJS.lib.WordArray
) => {
  const encrypted = CryptoJS.AES.encrypt(data, aesKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// const base64ToArrayBuffer = (base64: string): Uint8Array => {
//   const binaryString = window.atob(base64);
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return bytes;
// };

export const decryptRSA = async (encryptedData: string, publicKey: any) => {
  const publicKeyString = await window.crypto.subtle.importKey(
    "raw",
    publicKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"]
  );

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    publicKeyString,
    Buffer.from(encryptedData, "base64")
  );

  const decryptedDataString = new TextDecoder().decode(decryptedData);

  return decryptedDataString;
};

export const encryptAESKey = async (aesKey: any, rsaPublicKey: any) => {
  // Export AES key to raw format for encryption
  const rawAESKey = await window.crypto.subtle.exportKey("raw", aesKey);

  // Encrypt the AES key with the RSA public key
  const encryptedAESKey = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    rsaPublicKey, // The RSA public key to encrypt with
    rawAESKey // The AES key to encrypt (ArrayBuffer)
  );

  return encryptedAESKey;
};

export async function encryptAESKeyWithRSA(
  aesKey: CryptoJS.lib.WordArray,
  publicKey: CryptoKey
): Promise<string> {
  const aesKeyBuffer = aesKey.toString(CryptoJS.enc.Base64);
  const encryptedAESKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    new TextEncoder().encode(aesKeyBuffer) // Convert to byte array
  );
  return arrayBufferToBase64(encryptedAESKey);
}

export const generateAESKeyIV = async (): Promise<{
  aesKey: CryptoJS.lib.WordArray;
  iv: CryptoJS.lib.WordArray;
}> => {
  const aesKey = CryptoJS.lib.WordArray.random(32); // 256-bit key
  const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV

  return { aesKey, iv };
};

export const getRSAKey = async (): Promise<CryptoKey> => {
  const response = await fetch("http://localhost:8085/api/public_key");
  const data = await response.json();
  const { publicKey } = data;

  // convert the public key to a buffer
  const publicKeyBuffer = pemToArrayBuffer(publicKey);

  // convert the public key to a CryptoKey
  const publicCryptoKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
  return publicCryptoKey;
};

export const pemToArrayBuffer = (pem: string) => {
  const b64Lines = pem.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  const b64 = atob(b64Lines);
  const buffer = new ArrayBuffer(b64.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < b64.length; i++) {
    view[i] = b64.charCodeAt(i);
  }
  return buffer;
};
