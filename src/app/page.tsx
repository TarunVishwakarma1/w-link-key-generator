'use client';
import React, { useState, useEffect } from 'react';
import SideBar from './components/sideBar/sideBar';
import Ethereum from './components/ethereum/Ethereum';
import Solana from './components/solana/Solana';
import Wallets from './components/wallets/Wallets';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from
"@nextui-org/react";
import { EyeFilledIcon } from './components/ui/icons/EyeFilledIcon';
import { EyeSlashFilledIcon } from './components/ui/icons/EyeSlashedFilledIcon';
import crypto from 'crypto'
import { toast } from 'sonner';

export default function Home() {
const [selected, setSelected] = useState<'solana' | 'ethereum' | 'wallet'>('wallet');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [solPass, setSolPass] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [defPass, setDefPass] = useState('');
  const [pas, setPas] = useState('');

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSelect = (key: 'solana' | 'ethereum' | 'wallet') => {
  setSelected(key);
  };

  useEffect(() => {
    getPass();
  }, []);

  const getPass = () => {
    const storagePass = localStorage.getItem('wLinkSolPass');
    if (storagePass) {
      setModalHeader('Provide Password');
      setModalBody('Password found in local storage. Please provide your password.');
    } else {
      setModalHeader('Enter New Password');
      setModalBody('No password found in local storage. Please set a new password.');
    }
    onOpen();
  };

  const handleCheckAndVerifyPass = (onClose: () => void) => {
      if (!pas) {
        toast('No Password is provided');
        return;
      }

  const hashedPas = hashPassword(pas);
  const storedPass = localStorage.getItem('wLinkSolPass');

  if (storedPass) {
    if (hashedPas === storedPass) {
      setDefPass(hashedPas);
      setSolPass(hashedPas);
      onClose();
    } else {
      toast('Wrong Password! Try Again');
    }
  } else {
    localStorage.setItem('wLinkSolPass', hashedPas);
    setDefPass(hashedPas);
    setSolPass(hashedPas);
    onClose();
  }
  };

  const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
  }

  const handleKeyDown = (onClose: () => void, e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
  handleCheckAndVerifyPass(onClose);
  }
  }

  return (
  <div className="flex">
    {/* Modal Password */}
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}
      hideCloseButton={true}>
      <ModalContent>
        {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1 dark:text-white text-black">
            {modalHeader}
          </ModalHeader>
          <ModalBody>
            <p className='dark:text-white text-black'>{modalBody}</p>
            <Input isRequired label="Password" variant="bordered" placeholder="Enter your password" endContent={ <button
              className="focus:outline-none" type="button" onClick={toggleVisibility}
              aria-label="toggle password visibility">
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
            <Button color="primary" onPress={()=> handleCheckAndVerifyPass(onClose)}>
              Submit
            </Button>
          </ModalFooter>
        </>
        )}
      </ModalContent>
    </Modal>

    <SideBar onSelect={handleSelect} />
    <div className="flex-1 ml-48 p-4">
      {/* Render content based on the selected value */}
      {selected === 'solana' &&
      <Solana reqPass={defPass} />}
      {selected === 'ethereum' &&
      <Ethereum />}
      {selected === 'wallet' &&
      <Wallets />}
    </div>
  </div>
  );
  }