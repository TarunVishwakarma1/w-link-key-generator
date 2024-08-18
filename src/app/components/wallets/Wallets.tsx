import React, { useRef, useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { toast } from 'sonner';
import { encryptValue, decryptValue } from '../utils/cryptoUtils'; // Adjust the path to your utility functions
import CardComponent from '../ui/assets/ui-components/CardComponent'
import SolanaLogo from '../ui/assets/images/solana-sol-logo.svg'

interface KeyGenerateResult {
  mnemonic: string;
  secretKey: string;
  publicKey: string;
  type: string;
  walletName: string; // Added walletName field
}

const Wallets: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const LOCAL_STORAGE_KEY = "WlinkSolanaWallets";
  const PASSWORD_STORAGE_KEY = "wLinkSolPass";
  const [wallets, setWallets] = useState<KeyGenerateResult[]>([]);

  useEffect(() => {
    const storedWallets = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedWallets) {
      setWallets(JSON.parse(storedWallets));
    }
  }, []);

  const handleOpenModal = () => {
    onOpen();
  };

  const handleBackup = async () => {
    const wallets = localStorage.getItem(LOCAL_STORAGE_KEY);
    const password = localStorage.getItem(PASSWORD_STORAGE_KEY);

    if (!wallets || !password) {
      toast.error('No wallets found to backup or password missing.');
      return;
    }

    try {
      const encryptedWallets = await encryptValue(wallets, password);
      const blob = new Blob([encryptedWallets], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'solana_wallets_backup.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Backup successful!');
    } catch (error) {
      toast.error('Failed to encrypt wallets for backup.');
      console.error('Encryption error:', error);
    }
  };

  const handleRestoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Invalid file type. Please upload a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const password = localStorage.getItem(PASSWORD_STORAGE_KEY);

      if (!password) {
        toast.error('No password found in local storage.');
        return;
      }

      try {
        const decryptedContent = await decryptValue(content, password);
        const parsedWallets = JSON.parse(decryptedContent);

        if (!Array.isArray(parsedWallets)) {
          throw new Error('Invalid file structure: Expected an array of wallets.');
        }

        const isValid = parsedWallets.every((wallet) =>
          wallet &&
          typeof wallet === 'object' &&
          'publicKey' in wallet &&
          'secretKey' in wallet &&
          'mnemonic' in wallet &&
          'walletName' in wallet // Check for walletName field
        );

        if (!isValid) {
          throw new Error('Invalid wallet data in file.');
        }

        const existingWallets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');

        // Create a set of existing wallet private keys for quick lookup
        const existingWalletKeys = new Set(existingWallets.map((wallet: any) => wallet.secretKey));

        const newWallets = parsedWallets.filter(
          (wallet: any) => !existingWalletKeys.has(wallet.secretKey)
        );

        if (newWallets.length === 0) {
          toast('All wallets in the backup already exist.');
        } else {
          const updatedWallets = [...existingWallets, ...newWallets];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWallets));
          setWallets(updatedWallets); // Update the state with the new wallets
          toast.success(`${newWallets.length} wallets restored successfully.`);
        }
      } catch (error) {
        console.error("Failed to restore wallets:", error);
        toast.error(`Restore failed: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);

    // Reset the input value to allow re-uploading the same file if needed
    event.target.value = '';
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="text-4xl font-semibold col-span-3">
        Your Wallets
      </div>
      <div className='col-start-4 col-span-1'>
        <Button isLoading={false} color="primary" variant="shadow" onPress={handleOpenModal}>
          Backup / Restore
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='text-black dark:text-white'>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Backup and Restore Wallets</ModalHeader>
                <ModalBody>
                  <p>
                    Do you want to take a backup of all your wallets in a single file?
                  </p>
                  <Button color="primary" variant="shadow" onPress={handleBackup}>
                    Backup
                  </Button>
                  <div className="mt-4">
                    <p>
                      Do you want to restore wallets from a backup file?
                    </p>
                    <Button color="primary" variant="shadow" onPress={handleRestoreClick}>
                      Restore
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleRestore}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="ghost" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      {wallets.length === 0 ? (
        <div className="col-span-4 flex items-center justify-center h-3/4">
          <div className="text-center text-gray-300 dark:text-gray-600 text-4xl">
            No Wallets Here!
          </div>
        </div>
      ) : (
        wallets.map((data, index) => (
          <div className='mt-10 break-words' key={index}>
            <CardComponent image={SolanaLogo} BalanceAmountData={0.001} keysData={data} index={index} />
          </div>
        ))
      )}
    </div>
  );
};

export default Wallets;
