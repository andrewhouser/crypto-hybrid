import CryptoJS from "crypto-js";
import { API_ENDPOINT } from "../constatnts";

export const aesEncrypt = (
  data: string,
  aesKey: CryptoJS.lib.WordArray,
  iv: CryptoJS.lib.WordArray
) => {
  return CryptoJS.AES.encrypt(data, aesKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export async function encryptAESKeyWithRSA(
  aesKey: CryptoJS.lib.WordArray,
  publicKey: CryptoKey
): Promise<string> {
  // convert the aes key to a buffer
  const aesKeyBuffer = aesKey.toString(CryptoJS.enc.Base64);
  // convert the aes key buffer to a byte array
  const encryptedAESKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    new TextEncoder().encode(aesKeyBuffer) // Convert to byte array
  );
  // convert the encrypted aes key to a base64 string
  return arrayBufferToBase64(encryptedAESKey);
}

export const generateAESKeyIV = async (): Promise<{
  aesKey: CryptoJS.lib.WordArray;
  iv: CryptoJS.lib.WordArray;
}> => {
  return {
    aesKey: CryptoJS.lib.WordArray.random(32),
    iv: CryptoJS.lib.WordArray.random(16),
  };
};

export const getRSAKey = async (): Promise<CryptoKey> => {
  const response = await fetch(`${API_ENDPOINT}/public_key`);
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
