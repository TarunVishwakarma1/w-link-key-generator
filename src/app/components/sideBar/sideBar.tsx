'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const items = [
    { name: 'Wallets', key:'wallet'},
    { name: 'Solana Wallets', key: 'solana' },
    { name: 'Ethereum Wallets', key: 'ethereum' },
  
];

interface SideBarProps {
  onSelect: (key: 'solana' | 'ethereum' | 'wallet') => void;
}

const SideBar: React.FC<SideBarProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [selected, setSelected] = useState<'solana' | 'ethereum' | 'wallet'>('wallet');

  useEffect(() => {
    // Mount the component after the page has loaded
    setIsMounted(true);
  }, []);


  const handleClick = (key: 'solana' | 'ethereum'| 'wallet') => {
    setSelected(key);
    onSelect(key);
  };

  const itemVariants = {
    selected: {
      scale: 1.2,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    unselected: {
      scale: 0.9,
      opacity: 0.6,
      transition: { duration: 0.3 },
    },
  };

  if (!isMounted) {
    return null; // Don't render the component until after the page has loaded
  }

  return (
    <motion.div
      className={`fixed top-15 left-0 h-[calc(100vh-80px)] w-48 rounded-lg m-2 shadow-custom-shadow
        ${theme === 'dark' ? 'bg-glass-dark border-glass-border-dark' : 'bg-glass-light border-glass-border-light'}
        backdrop-blur-md z-10 hidden sm:flex
      `}
      initial={{ opacity: 0 }} // Initial state
      animate={{ opacity: 1 }} // Final state
      transition={{ duration: 1 }} // Duration of the fade effect
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        {items.map((item) => (
          <motion.div
            key={item.key} // Unique key prop
            className="flex items-center justify-center text-center cursor-pointer my-1"
            onClick={() => handleClick(item.key as 'solana' | 'ethereum' | 'wallet')}
            animate={selected === item.key ? 'selected' : 'unselected'}
            variants={itemVariants}
          >
            {item.name}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SideBar;
