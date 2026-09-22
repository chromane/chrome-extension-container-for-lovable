/**
 * Derives an AES-GCM key from a password and a salt using PBKDF2.
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts a Blob with a password.
 * Returns a new Blob containing: [salt][iv][encryptedData]
 */
export async function encryptBlob(blob, password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const arrayBuffer = await blob.arrayBuffer();
  const encryptedBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, arrayBuffer);

  // Combine metadata and encrypted payload into one complete Blob
  return new Blob([salt, iv, encryptedBuffer], { type: "application/octet-stream" });
}

/**
 * Decrypts a packed Blob using the password.
 * Returns the original decrypted Blob.
 */
export async function decryptBlob(encryptedBlob, password, originalMimeType = "application/octet-stream") {
  const fullBuffer = await encryptedBlob.arrayBuffer();

  // Extract metadata slices based on exact byte alignments
  const salt = fullBuffer.slice(0, 16);
  const iv = fullBuffer.slice(16, 28);
  const encryptedData = fullBuffer.slice(28);

  const key = await deriveKey(password, new Uint8Array(salt));

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, encryptedData);
    return new Blob([decryptedBuffer], { type: originalMimeType });
  } catch (error) {
    throw new Error("Decryption failed. Wrong password or corrupted file structure.");
  }
}
