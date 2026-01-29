'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Layers, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

interface MobileNavProps {
    onSelect: (key: 'solana' | 'ethereum' | 'wallet') => void;
    selected: 'solana' | 'ethereum' | 'wallet';
}

const MobileNav: React.FC<MobileNavProps> = ({ onSelect, selected }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const items = [
        { name: 'Wallets', key: 'wallet', icon: Wallet },
        { name: 'Solana', key: 'solana', icon: Zap },
        { name: 'Ethereum', key: 'ethereum', icon: Layers },
    ];

    if (!mounted) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden pointer-events-none">
            <motion.div
                className={`mx-auto flex w-full max-w-lg items-center justify-around rounded-2xl border p-2 shadow-xl backdrop-blur-xl pointer-events-auto
          ${theme === 'dark'
                        ? 'bg-black/80 border-white/10 text-white'
                        : 'bg-white/80 border-black/5 text-black'
                    }
        `}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selected === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => onSelect(item.key as 'solana' | 'ethereum' | 'wallet')}
                            className={`flex flex-col items-center justify-center space-y-1 rounded-xl px-4 py-2 transition-all duration-300
                ${isSelected
                                    ? 'text-primary scale-110'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }
              `}
                        >
                            <div className={`relative p-2 rounded-full transition-colors ${isSelected ? 'bg-primary/10' : 'bg-transparent'}`}>
                                <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default MobileNav;
