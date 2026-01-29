import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { toast } from 'sonner';
import { useDisclosure } from "@nextui-org/react";

export function useAuth() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalHeader, setModalHeader] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [defPass, setDefPass] = useState(''); // The verified/set password hash
  
  // Checking for existing password on mount
  useEffect(() => {
    checkPasswordStatus();
  }, []);

  const checkPasswordStatus = () => {
    const storagePass = localStorage.getItem('wLinkSolPass');
    if (storagePass) {
      setModalHeader('Provide Password');
      setModalBody('Password found. Please provide your password.');
    } else {
      setModalHeader('Enter New Password');
      setModalBody('No password found. Please set a new password.');
    }
    onOpen();
  };

  const hashPassword = (password: string) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const verifyAndSetPassword = (inputPassword: string) => {
    if (!inputPassword) {
      toast.error('No Password provided');
      return false;
    }

    const hashedPas = hashPassword(inputPassword);
    const storedPass = localStorage.getItem('wLinkSolPass');

    if (storedPass) {
      if (hashedPas === storedPass) {
        setDefPass(hashedPas);
        onClose(); // Close the modal
        toast.success('Access Granted');
        return true;
      } else {
        toast.error('Wrong Password! Try Again');
        return false;
      }
    } else {
      localStorage.setItem('wLinkSolPass', hashedPas);
      setDefPass(hashedPas);
      onClose();
      toast.success('Password Set Successfully');
      return true;
    }
  };

  return {
    isOpen,
    onOpenChange,
    modalHeader,
    modalBody,
    defPass,
    handleCheckAndVerifyPass: verifyAndSetPassword,
  };
}
