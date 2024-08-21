import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { publicKey, type } = await request.json();

    let url = '';
    let requestBody = {};

    if (type === 'solana') {
      const urll = process.env.NEXT_PUBLIC_ENVIRONMET=='local'?process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_SOLANA_API:process.env.NEXT_PUBLIC_ALCHEMY_SOLANA_API;
      url = `${urll}${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      requestBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [publicKey],
      };

      
    } else if (type === 'Ethereum') {
      url = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      requestBody = {
        id: 1,
        jsonrpc: "2.0",
        params: [publicKey, "latest"],
        method: "eth_getBalance"
      };
     
    }

    const response = await axios.post(url, requestBody);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching balance:", error.response ? error.response.data : error.message);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
