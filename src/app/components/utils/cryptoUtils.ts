// This function converts a string to an ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
    return new TextEncoder().encode(str).buffer;
  }
  
  // This function converts an ArrayBuffer to a hex string
  function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // This function converts a hex string to an ArrayBuffer
  function hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
  }
  
  // Derive a key from the password using PBKDF2
  async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      stringToArrayBuffer(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
  
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-CTR', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // Encrypt a value using AES-CTR
  export async function encryptValue(value: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes salt
    const iv = crypto.getRandomValues(new Uint8Array(16));   // 16 bytes IV
    const key = await deriveKey(password, salt.buffer);
  
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CTR', counter: iv, length: 64 },
      key,
      stringToArrayBuffer(value)
    );
  
    return `${arrayBufferToHex(salt.buffer)}:${arrayBufferToHex(iv.buffer)}:${arrayBufferToHex(encrypted)}`;
  }
  
  // Decrypt a value using AES-CTR
  export async function decryptValue(encryptedValue: string, password: string): Promise<string> {
    const [saltHex, ivHex, encryptedHex] = encryptedValue.split(':');
  
    const salt = hexToArrayBuffer(saltHex);
    const iv = hexToArrayBuffer(ivHex);
    const encrypted = hexToArrayBuffer(encryptedHex);
    const key = await deriveKey(password, salt);
  
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CTR', counter: iv, length: 64 },
      key,
      encrypted
    );
  
    return new TextDecoder().decode(decrypted);
  }
  
  export async function encryptWallets(value: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes salt
    const iv = crypto.getRandomValues(new Uint8Array(16));   // 16 bytes IV
    const key = await deriveKey(password, salt.buffer);
  
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CTR', counter: iv, length: 64 },
      key,
      stringToArrayBuffer(value)
    );
  
    return `${arrayBufferToHex(salt.buffer)}:${arrayBufferToHex(iv.buffer)}:${arrayBufferToHex(encrypted)}`;
  }

  export async function decryptWallets(encryptedValue: string, password: string): Promise<string> {
    const [saltHex, ivHex, encryptedHex] = encryptedValue.split(':');
  
    const salt = hexToArrayBuffer(saltHex);
    const iv = hexToArrayBuffer(ivHex);
    const encrypted = hexToArrayBuffer(encryptedHex);
    const key = await deriveKey(password, salt);
  
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CTR', counter: iv, length: 64 },
      key,
      encrypted
    );
  
    return new TextDecoder().decode(decrypted);
  }
