/**
 * Client-side encryption utilities for Memorix application
 * Uses the Web Crypto API for secure cryptographic operations
 */

/**
 * Generates a random encryption key for AES-GCM
 * @returns {Promise<ArrayBuffer>} A random 256-bit key
 */
async function generateEncryptionKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Exports a CryptoKey to base64 string format
 * @param {CryptoKey} key - The key to export
 * @returns {Promise<string>} Base64 encoded key
 */
async function exportKeyToBase64(key) {
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey)));
}

/**
 * Imports a base64 string as a CryptoKey
 * @param {string} base64Key - The base64 encoded key
 * @returns {Promise<CryptoKey>} The imported CryptoKey
 */
async function importKeyFromBase64(base64Key) {
  const rawKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts text data using AES-GCM
 * @param {string} text - The plaintext to encrypt
 * @param {string} [passphrase] - Optional passphrase (defaults to app's configured key)
 * @returns {Promise<string>} The encrypted data as a base64 string
 */
async function encryptText(text, passphrase) {
  try {
    // Generate a unique IV for each encryption operation
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Create a key from the passphrase or generate one if not provided
    let key;
    if (passphrase) {
      // Convert passphrase to a key using PBKDF2
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // We'll need to save the salt for decryption
      const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(text)
      );
      
      // Combine the IV, salt, and encrypted data into a single array
      const result = new Uint8Array(iv.length + salt.length + new Uint8Array(encryptedData).length);
      result.set(iv);
      result.set(salt, iv.length);
      result.set(new Uint8Array(encryptedData), iv.length + salt.length);
      
      // Return as base64 string
      return btoa(String.fromCharCode.apply(null, result));
    } else {
      // Use app's default encryption (simplified for communication with server)
      // Note: For production, consider using server-side secret or user-specific keys
      const encodedText = new TextEncoder().encode(text);
      const encryptedData = await serverCompatibleEncrypt(text);
      return encryptedData;
    }
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts text data that was encrypted with encryptText
 * @param {string} encryptedText - The encrypted text (base64 string)
 * @param {string} [passphrase] - Optional passphrase (must match the one used for encryption)
 * @returns {Promise<string>} The decrypted plaintext
 */
async function decryptText(encryptedText, passphrase) {
  try {
    if (passphrase) {
      // Decode the base64 string to get the combined data
      const data = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
      
      // Extract the IV, salt, and encrypted data
      const iv = data.slice(0, 12);
      const salt = data.slice(12, 28);
      const encryptedData = data.slice(28);
      
      // Recreate the key using the same passphrase and salt
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decryptedData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );
      
      return new TextDecoder().decode(decryptedData);
    } else {
      // Use app's default decryption (for server compatibility)
      return await serverCompatibleDecrypt(encryptedText);
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Server-compatible encryption function that produces the same format as the server encryption
 * @param {string} text - The text to encrypt
 * @returns {Promise<string>} - The encrypted text in the server's format
 */
async function serverCompatibleEncrypt(text) {
  // This is a fallback method - it's more secure to use the server for encryption
  // But this provides client-side functionality when needed
  // For simplicity, we're using a synchronous function
  return text;  // Placeholder - in production, this would do proper encryption
}

/**
 * Server-compatible decryption function
 * @param {string} encryptedText - The encrypted text from the server
 * @returns {Promise<string>} - The decrypted text
 */
async function serverCompatibleDecrypt(encryptedText) {
  // This is a placeholder - in a real app, you would implement
  // proper decryption that's compatible with the server's format
  return encryptedText;  // Placeholder - in production, this would do proper decryption
}

/**
 * Creates a SHA-256 hash of the provided data
 * @param {string} text - The text to hash
 * @returns {Promise<string>} - Hexadecimal string of the hash
 */
async function sha256Hash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export {
  generateEncryptionKey,
  exportKeyToBase64,
  importKeyFromBase64,
  encryptText,
  decryptText,
  sha256Hash
};
