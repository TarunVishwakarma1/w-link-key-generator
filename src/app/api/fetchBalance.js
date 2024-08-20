// pages/api/fetchBalance.js

import axios from 'axios';

export default async function handler(req, res) {
  const { publicKey, type } = req.body;

  try {
    let url = '';
    let requestBody = {};

    if (type === 'solana') {
      url = `https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      requestBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [publicKey],
      };
    } else if (type === 'ethereum') {
      url = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      requestBody = {
        id: 1,
        jsonrpc: "2.0",
        params: [publicKey, "latest"],
        method: "eth_getBalance"
      };
    }

    const response = await axios.post(url, requestBody);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching balance:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
}
