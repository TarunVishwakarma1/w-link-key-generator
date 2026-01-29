'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const items = [
  { name: 'Wallets', key: 'wallet' },
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


  const handleClick = (key: 'solana' | 'ethereum' | 'wallet') => {
    setSelected(key);
    onSelect(key);
  };

  const itemVariants = {
    selected: {
      scale: 1.05,
      backgroundColor: theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 },
    },
    unselected: {
      scale: 1,
      backgroundColor: "transparent",
      transition: { duration: 0.2 },
    },
  };

  if (!isMounted) {
    return null; // Don't render the component until after the page has loaded
  }

  return (
    <motion.div
      className={`fixed top-20 left-4 h-[calc(100vh-6rem)] w-60 rounded-xl shadow-lg border
        ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/40 border-black/5'}
        backdrop-blur-xl z-40 hidden sm:flex flex-col p-4
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-2 w-full mt-4">
        {items.map((item) => (
          <motion.div
            key={item.key}
            className={`w-full p-3 rounded-lg cursor-pointer text-sm font-medium transition-colors
              ${selected === item.key
                ? 'text-primary'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}
            `}
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
