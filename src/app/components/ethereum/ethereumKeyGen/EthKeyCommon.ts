import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { hdkey as EthereumHDKey } from "ethereumjs-wallet";
import crypto from 'crypto';
import * as aesjs from 'aes-js';
import { toast } from "sonner";

type EncryptProps = {
    privateKey: string;
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

type KeyGenerateProps = {
    state?:number;
    mnemonic?: string;
};

// Utility to validate a mnemonic
function validateMnemonicPhrase(mnemonic: string): void {
    if (!validateMnemonic(mnemonic)) {
        toast('Invalid mnemonic phrase');
    }
}

// Encrypt a private key
function encryptValue({ privateKey, password }: EncryptProps) {
    if (!privateKey || !password) {
        toast('No password or private key provided');
    }

    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const nonce = crypto.randomBytes(16);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonce));
    const privateKeyBytes = aesjs.utils.hex.toBytes(privateKey);
    const encryptedBytes = aesCtr.encrypt(privateKeyBytes);

    return {
        encryptedPrivateKey: aesjs.utils.hex.fromBytes(encryptedBytes),
        salt: salt.toString('hex'),
        nonce: nonce.toString('hex'),
    };
}

// Decrypt an encrypted private key
function decryptKey({ encryptedPrivateKey, password, salt, nonce }: DecryptProps): string {
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256');
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(Buffer.from(nonce, 'hex')));
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedPrivateKey);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    return aesjs.utils.hex.fromBytes(decryptedBytes);
}

// Store keys in local storage
function storeKeys({ publicKey, encryptedPrivateKey, salt, nonce }: StoreKeysProps): void {
    localStorage.setItem('ethereumPublicKey', publicKey);
    localStorage.setItem('ethereumEncryptedPrivateKey', encryptedPrivateKey);
    localStorage.setItem('ethereumSalt', salt);
    localStorage.setItem('ethereumNonce', nonce);
}

// Retrieve keys from local storage
function retrieveKeys({ password }: RetrieveKeysProps) {
    const publicKey = localStorage.getItem('ethereumPublicKey');
    const encryptedPrivateKey = localStorage.getItem('ethereumEncryptedPrivateKey');
    const salt = localStorage.getItem('ethereumSalt');
    const nonce = localStorage.getItem('ethereumNonce');

    if (publicKey && encryptedPrivateKey && salt && nonce) {
        const privateKey = decryptKey({ encryptedPrivateKey, password, salt, nonce });
        return { publicKey, privateKey };
    }

    toast('Keys not found or incorrect password.');
}

// Generate an Ethereum wallet
function generateEthereumWallet({state, mnemonic }: KeyGenerateProps = {}) {
    if (!mnemonic) {
        mnemonic = generateMnemonic();
    }
    validateMnemonicPhrase(mnemonic);

    const seed = mnemonicToSeedSync(mnemonic);
    const hdwallet = EthereumHDKey.fromMasterSeed(seed);

    // Use the BIP-44 derivation path for Ethereum
    const derivationPath = "m/44'/60'/0'/0/0";
    const walletNode = hdwallet.derivePath(derivationPath);
    const keypair = walletNode.getWallet();

    const secretKey = keypair.getPrivateKey().toString('hex');
    const publicKey = keypair.getAddressString();

    return { mnemonic, secretKey, publicKey };
}

export {
    encryptValue,
    decryptKey,
    storeKeys,
    retrieveKeys,
    generateEthereumWallet,
};
