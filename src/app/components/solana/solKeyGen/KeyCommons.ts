import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey } from "@solana/web3.js";
import crypto from 'crypto';
import * as aesjs from 'aes-js';
import bs58 from 'bs58';

type EncryptProps = {
    privateKey?: string;
    password: string;
};

type DecryptProps = {
    encryptedPrivateKey: string;
    password: string;
    salt: string;
    nonce: string;
};

type StoreKeysProps = {
    publicKey: string;
    encryptedPrivateKey: string;
    salt: string;
    nonce: string;
};

type RetrieveKeysProps = {
    password: string;
};

type keyGenerateProps = {
    state: number;
    mnemonic?: string;
};

type SignatureProps = {
    message:string
    privateKey:string
}

type VerifyTransactionProps = {
    message:string
    signature:Uint8Array
    publicKey:string
}

function encryptPrivateKey({ privateKey, password }: EncryptProps) {
  if (!privateKey || !password) {
    throw new Error('No Password or private key provided');
  }
  try {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const nonce = crypto.randomBytes(16);

    
    console.log(aesjs); // Check if aesjs is imported correctly
    console.log(typeof aesjs.Counter); // Check if Counter is a function
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonce));
    const privateKeyBytes = aesjs.utils.hex.toBytes(privateKey);
    const encryptedBytes = aesCtr.encrypt(privateKeyBytes);

    return {
      encryptedPrivateKey: aesjs.utils.hex.fromBytes(encryptedBytes),
      salt: salt.toString('hex'),
      nonce: nonce.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

function decryptKey({ encryptedPrivateKey, password, salt, nonce }: DecryptProps) {
    try {
        const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256');
        const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(Buffer.from(nonce, 'hex')));
        const encryptedBytes = aesjs.utils.hex.toBytes(encryptedPrivateKey);
        const decryptedBytes = aesCtr.decrypt(encryptedBytes);

        return aesjs.utils.hex.fromBytes(decryptedBytes);
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

function storeKeys({ publicKey, encryptedPrivateKey, salt, nonce }: StoreKeysProps) {
    localStorage.setItem('wLinksolanaPublicKey', publicKey);
    localStorage.setItem('wLinksolanaEncryptedPrivateKey', encryptedPrivateKey);
    localStorage.setItem('wLinksolanaSalt', salt);
    localStorage.setItem('wLinksolanaNonce', nonce);
}

function retrieveKeys({ password }: RetrieveKeysProps) {
    try {
        const publicKey = localStorage.getItem('wLinksolanaPublicKey');
        const encryptedPrivateKey = localStorage.getItem('wLinksolanaEncryptedPrivateKey');
        const salt = localStorage.getItem('wLinksolanaSalt');
        const nonce = localStorage.getItem('wLinksolanaNonce');

        if (publicKey && encryptedPrivateKey && salt && nonce) {
            const privateKey = decryptKey({ encryptedPrivateKey, password, salt, nonce });
            return { publicKey, privateKey };
        }

        throw new Error('Keys not found or incorrect password.');
    } catch (error) {
        console.error('Key retrieval error:', error);
        throw error;
    }
}

function KeyGenerate({ state, mnemonic }: keyGenerateProps) {
    if (!mnemonic) {
        mnemonic = generateMnemonic();
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${state}'/0'`;
    const { key: derivedSeed } = derivePath(path, seed.toString('hex'));
    const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
    const secretKey = Buffer.from(keypair.secretKey).toString('hex')
    const publicKey = Keypair.fromSecretKey(keypair.secretKey).publicKey.toBase58();

    return {
        mnemonic: mnemonic,
        secretKey: secretKey,
        publicKey: publicKey,
    };
}

function signature({ message, privateKey }: SignatureProps) {
    const decodedMessage = new TextEncoder().encode(message);
  
    // Convert privateKey from hex to Uint8Array
    const privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKey, 'hex'));
  
    // Create a keypair from the privateKeyUint8Array
    const keypair = nacl.sign.keyPair.fromSecretKey(privateKeyUint8Array);
  
    // Sign the message
    const signature = nacl.sign.detached(decodedMessage, keypair.secretKey);
  
    return signature;
  }

function verifyTransaction({message, signature, publicKey}:VerifyTransactionProps){
    const decodedMessage = new TextEncoder().encode(message);
    const pubKey = bs58.decode(publicKey);
    return nacl.sign.detached.verify(decodedMessage,signature,pubKey);
}

export { encryptPrivateKey, decryptKey, storeKeys, retrieveKeys, KeyGenerate, signature,verifyTransaction };