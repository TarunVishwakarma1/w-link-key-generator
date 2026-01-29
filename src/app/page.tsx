'use client';

import React, { useState } from 'react';
import SideBar from './components/sideBar/sideBar';
import Ethereum from './components/ethereum/Ethereum';
import Solana from './components/solana/Solana';
import Wallets from './components/wallets/Wallets';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { EyeFilledIcon } from './components/ui/icons/EyeFilledIcon';
import { EyeSlashFilledIcon } from './components/ui/icons/EyeSlashedFilledIcon';
import { useAuth } from '@/hooks/useAuth';
import MobileNav from '@/app/components/ui/MobileNav';

export default function Home() {
  const [selected, setSelected] = useState<'solana' | 'ethereum' | 'wallet'>('wallet');
  const [isVisible, setIsVisible] = useState(false);
  const [pas, setPas] = useState('');

  const { isOpen, onOpenChange, modalHeader, modalBody, defPass, handleCheckAndVerifyPass } = useAuth();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSelect = (key: 'solana' | 'ethereum' | 'wallet') => {
    setSelected(key);
  };

  const handleKeyDown = (onClose: () => void, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckAndVerifyPass(pas);
    }
  }

  const onSubmit = (onClose: () => void) => {
    const success = handleCheckAndVerifyPass(pas);
  }

  return (
    <div className="flex min-h-screen flex-col sm:flex-row pb-24 sm:pb-0">
      <MobileNav onSelect={handleSelect} selected={selected} />

      {/* Modal Password */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        hideCloseButton={true}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 dark:text-white text-black">
                {modalHeader}
              </ModalHeader>
              <ModalBody>
                <p className='dark:text-white text-black'>{modalBody}</p>
                <Input
                  isRequired
                  label="Password"
                  variant="bordered"
                  placeholder="Enter your password"
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                      aria-label="toggle password visibility"
                    >
                      {isVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                  className="max-w-xs dark:text-white text-black"
                  onChange={(e) => setPas(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(onClose, e)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => onSubmit(onClose)}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <SideBar onSelect={handleSelect} />

      <main className="flex-1 sm:ml-64 p-4 w-full transition-all duration-300">
        {/* Render content based on the selected value */}
        <div className="w-full max-w-7xl mx-auto">
          {selected === 'solana' && <Solana reqPass={defPass} />}
          {selected === 'ethereum' && <Ethereum />}
          {selected === 'wallet' && <Wallets />}
        </div>
      </main>
    </div>
  );
}