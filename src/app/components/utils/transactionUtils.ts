import axios from "axios";
import { toast } from 'sonner';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from "@solana/web3.js";
import { ethers } from "ethers";

// Define types for Solana API responses
interface SolanaSignatureResponse {
  result: Array<{ signature: string }>;
}

interface SolanaTransactionDetailResponse {
  result: any; // You might want to refine this type based on the structure of Solana transactions
}

// Define types for Ethereum API responses
interface EthereumTransfer {
  blockNum: string;
  from: string;
  to: string;
  value: string;
  asset: string;
  category: string;
  rawContract: {
    value: string;
    address: string;
    decimal: string;
  };
  metadata?: any; // Depending on your use case, refine this type
}

interface EthereumTransactionResponse {
  result: {
    transfers: EthereumTransfer[];
  };
}



function hexToUint8Array(hex: string): Uint8Array {
    if (hex.startsWith("0x")) {
      hex = hex.slice(2);
    }
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  }


// Solana Transactions

export const getSolanaTransactions = async (publicKey: string): Promise<string[]> => {
  const url = `https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "getSignaturesForAddress",
    params: [publicKey, { limit: 10 }] // Adjust the limit as needed
  };

  try {
    const response = await axios.post<SolanaSignatureResponse>(url, requestBody);
    const signatures = response.data.result.map(sig => sig.signature);
    return signatures;
  } catch (error) {
    console.error("Error fetching Solana transactions:", error);
    toast('Failed to fetch Solana transactions');
    return [];
  }
};

export const getSolanaTransactionDetails = async (signatures: string[]): Promise<any[]> => {
  const url = `https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  const transactionDetails: any[] = [];

  try {
    for (const signature of signatures) {
      const requestBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [signature, { encoding: "jsonParsed" }] // jsonParsed provides metadata
      };

      const response = await axios.post<SolanaTransactionDetailResponse>(url, requestBody);
      transactionDetails.push(response.data.result);
    }
  } catch (error) {
    console.error("Error fetching Solana transaction details:", error);
    toast('Failed to fetch Solana transaction details');
  }

  return transactionDetails;
};

export const fetchSolanaTransactionHistory = async (publicKey: string): Promise<any[]> => {
  const signatures = await getSolanaTransactions(publicKey);
  const transactions = await getSolanaTransactionDetails(signatures);
  return transactions;
};

// Ethereum Transactions

export const getEthereumTransactions = async (publicKey: string): Promise<EthereumTransfer[]> => {
  const url = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromAddress: publicKey, // Specify the wallet address
        toAddress: publicKey,
        category: ["external", "internal", "erc20", "erc721", "erc1155"], // Include different types of transfers
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: "0x10" // Hexadecimal format for number of transactions (16 transactions in this case)
      }
    ]
  };

  try {
    const response = await axios.post<EthereumTransactionResponse>(url, requestBody);
    return response.data.result.transfers; // Array of transactions with metadata
  } catch (error) {
    console.error("Error fetching Ethereum transactions:", error);
    toast('Failed to fetch Ethereum transactions');
    return [];
  }
};

// Combined Transaction History Fetcher

export const fetchTransactionHistory = async (publicKey: string, type: 'solana' | 'Ethereum'): Promise<any[]> => {
  if (type === 'solana') {
    return await fetchSolanaTransactionHistory(publicKey);
  } else if (type === 'Ethereum') {
    return await getEthereumTransactions(publicKey);
  } else {
    return [];
  }
};

// Function to send Solana
export const sendSolana = async (privateKeyHex: string, recipientAddress: string, amountToSend: number) => {
    try {
      const privateKey = hexToUint8Array(privateKeyHex); // Convert the hex key to Uint8Array
  
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const fromKeypair = Keypair.fromSecretKey(privateKey); // Create Keypair from private key
      const fromPubKey = fromKeypair.publicKey;
      const toPubKey = new PublicKey(recipientAddress);
  
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: Math.floor(amountToSend * 1_000_000_000), // Convert SOL to Lamports
        })
      );
  
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubKey;
  
      // Sign the transaction with the Keypair
      transaction.sign(fromKeypair);
  
      // Serialize the transaction
      const serializedTransaction = transaction.serialize();
  
      // Send the serialized transaction
      const signature = await connection.sendRawTransaction(serializedTransaction);
  
      await connection.confirmTransaction(signature);
      toast('Transaction successful!');
      return true;
    } catch (error) {
      console.error("Error sending Solana:", error);
      toast('Failed to send Solana.');
      return false;
    }
  };
  
  // Function to send Ethereum
  export const sendEthereum = async (privateKey: string, recipientAddress: string, amountToSend: number) => {
    try {
      // Connect to the Ethereum network
      const provider = ethers.getDefaultProvider('mainnet'); // Replace 'mainnet' with your desired network
  
      // Create a wallet instance using the provided private key and provider
      const wallet = new ethers.Wallet(privateKey, provider);
  
      const tx = {
        to: recipientAddress,
        value: ethers.utils.parseEther(amountToSend.toString()), // Convert ETH to Wei
        gasLimit: ethers.utils.hexlify(21000), // Gas limit for a standard ETH transfer
      };
  
      // Sign and send the transaction
      const transactionResponse = await wallet.sendTransaction(tx);
      await transactionResponse.wait(); // Wait for the transaction to be mined
  
      toast('Transaction successful!');
      return true;
    } catch (error) {
      console.error("Error sending Ethereum:", error);
      toast('Failed to send Ethereum.');
      return false;
    }
  };