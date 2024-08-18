'use client';
import React, { useState } from 'react';
import SideBar from './components/sideBar/sideBar';
import Ethereum from './components/ethereum/Ethereum';
import Solana from './components/solana/Solana';
import Wallets from './components/wallets/Wallets';

export default function Home() {
  const [selected, setSelected] = useState<'solana' | 'ethereum' | 'wallet'>('wallet');

  const handleSelect = (key: 'solana' | 'ethereum' | 'wallet') => {
    setSelected(key);
  };

  return (
    <div className="flex">
      <SideBar onSelect={handleSelect} />
      <div className="flex-1 ml-48 p-4"> {/* Ensure this has margin-left to account for sidebar width */}
        {/* Render content based on the selected value */}
        <div>
        {selected === 'solana' && 
        <div>
          <Solana/>
        </div>
          }
        {selected === 'ethereum' && 
        <div>
          <Ethereum/>
        </div>}
        {selected === 'wallet' &&
        <div>
          <Wallets/>
        </div>}
        </div>
      </div>
    </div>
  );
}
