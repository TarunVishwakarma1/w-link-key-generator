import React, { useRef, useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { toast } from 'sonner';
import { encryptWallets, decryptWallets } from '../utils/cryptoUtils';
import CardComponent from '../ui/assets/ui-components/CardComponent';
import SolanaLogo from '../ui/assets/images/solana-sol-logo.svg';
import EthereumLogo from '../ui/assets/images/ethereum-eth-logo.svg';

interface KeyGenerateResult {
  mnemonic: string;
  secretKey: string;
  publicKey: string;
  type: string;
  walletName: string;
}

const Wallets: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const SOLANA_STORAGE_KEY = "WlinkSolanaWallets";
  const ETHEREUM_STORAGE_KEY = "WlinkEthereumWallets";
  const PASSWORD_STORAGE_KEY = "wLinkSolPass";
  const [wallets, setWallets] = useState<KeyGenerateResult[]>([]);

  useEffect(() => {
    const loadWallets = async () => {
      const storedSolanaWallets = localStorage.getItem(SOLANA_STORAGE_KEY);
      const storedEthereumWallets = localStorage.getItem(ETHEREUM_STORAGE_KEY);
      const password = localStorage.getItem(PASSWORD_STORAGE_KEY);

      if (password) {
        try {
          const decryptedSolanaWallets = storedSolanaWallets
            ? await decryptWallets(storedSolanaWallets, password)
            : "[]";
          const decryptedEthereumWallets = storedEthereumWallets
            ? await decryptWallets(storedEthereumWallets, password)
            : "[]";

          const solanaWallets = JSON.parse(decryptedSolanaWallets);
          const ethereumWallets = JSON.parse(decryptedEthereumWallets);

          setWallets([...solanaWallets, ...ethereumWallets]);
        } catch (error) {
          toast.error('Failed to decrypt wallets.');
          console.error('Decryption error:', error);
        }
      }
    };

    loadWallets();
  }, []);

  const handleOpenModal = () => {
    onOpen();
  };

  const handleBackup = async () => {
    const storedSolanaWallets = localStorage.getItem(SOLANA_STORAGE_KEY);
    const storedEthereumWallets = localStorage.getItem(ETHEREUM_STORAGE_KEY);
  
    // If there are no wallets in local storage, show an error message
    if (!storedSolanaWallets && !storedEthereumWallets) {
      toast.error('No wallets found to backup.');
      return;
    }
  
    try {
      // Decrypt the stored wallets if they exist, otherwise initialize as empty arrays
      const solanaWallets = storedSolanaWallets
        ? JSON.parse(await decryptWallets(storedSolanaWallets, localStorage.getItem(PASSWORD_STORAGE_KEY)!))
        : [];
  
      const ethereumWallets = storedEthereumWallets
        ? JSON.parse(await decryptWallets(storedEthereumWallets, localStorage.getItem(PASSWORD_STORAGE_KEY)!))
        : [];
  
      // Check if both arrays are empty
      if (solanaWallets.length === 0 && ethereumWallets.length === 0) {
        toast.error('No wallets found to backup.');
        return;
      }
  
      // Combine the wallets into a single object
      const combinedWallets = {
        solana: solanaWallets,
        ethereum: ethereumWallets,
      };
  
      // Encrypt the combined wallets object
      const encryptedCombinedWallets = await encryptWallets(JSON.stringify(combinedWallets), localStorage.getItem(PASSWORD_STORAGE_KEY)!);
      
      // Create a downloadable file from the encrypted data
      const blob = new Blob([encryptedCombinedWallets], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wlink_wallets_backup.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
  
      // Show a success message
      toast.success('Backup successful!');
    } catch (error) {
      toast.error('Failed to backup wallets.');
      console.error('Backup error:', error);
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
      let backupEncryptedContent = reader.result as string;
      const password = localStorage.getItem(PASSWORD_STORAGE_KEY);
  
      if (!password) {
        toast.error('No password found in local storage.');
        return;
      }
  
      try {
        const decryptedBackupContent = JSON.parse(await decryptWallets(backupEncryptedContent, password));
        console.log(`decryptedBackupContent ${JSON.stringify(decryptedBackupContent)}`);
        let solanaBackupWallets = [];
        let ethereumBackupWallets = [];
  
        if (Array.isArray(decryptedBackupContent)) {
          if (decryptedBackupContent[0].type === 'solana') {
            solanaBackupWallets = decryptedBackupContent;
          } else {
            ethereumBackupWallets = decryptedBackupContent;
          }
        } else {
          // When it's an object with solana and ethereum arrays
          solanaBackupWallets = decryptedBackupContent.solana || [];
          ethereumBackupWallets = decryptedBackupContent.ethereum || [];
        }
  
        // Decrypt existing wallets or initialize as empty arrays if none exist
        const storedSolanaWallets = localStorage.getItem(SOLANA_STORAGE_KEY);
        const storedEthereumWallets = localStorage.getItem(ETHEREUM_STORAGE_KEY);
  
        const currentSolanaWallets = storedSolanaWallets
          ? JSON.parse(await decryptWallets(storedSolanaWallets, password))
          : [];
  
        const currentEthereumWallets = storedEthereumWallets
          ? JSON.parse(await decryptWallets(storedEthereumWallets, password))
          : [];
  
        // Merge wallets and avoid duplicates
        const existingSolanaKeys = new Set(currentSolanaWallets.map((wallet: any) => wallet.secretKey));
        const newSolanaWallets = solanaBackupWallets.filter((wallet: any) => !existingSolanaKeys.has(wallet.secretKey));
        const updatedSolanaWallets = [...currentSolanaWallets, ...newSolanaWallets];
  
        const existingEthereumKeys = new Set(currentEthereumWallets.map((wallet: any) => wallet.secretKey));
        const newEthereumWallets = ethereumBackupWallets.filter((wallet: any) => !existingEthereumKeys.has(wallet.secretKey));
        const updatedEthereumWallets = [...currentEthereumWallets, ...newEthereumWallets];
  
        // Count of successfully restored wallets
        const restoredSolanaCount = newSolanaWallets.length;
        const restoredEthereumCount = newEthereumWallets.length;
  
        // Encrypt and store the updated wallets
        const encryptedSolanaWallets = await encryptWallets(JSON.stringify(updatedSolanaWallets), password);
        const encryptedEthereumWallets = await encryptWallets(JSON.stringify(updatedEthereumWallets), password);
  
        localStorage.setItem(SOLANA_STORAGE_KEY, encryptedSolanaWallets);
        localStorage.setItem(ETHEREUM_STORAGE_KEY, encryptedEthereumWallets);
  
        // Update the UI with the combined wallets
        setWallets([...updatedSolanaWallets, ...updatedEthereumWallets]);
  
        // Display success message with count of restored wallets
        if (restoredSolanaCount === 0 && restoredEthereumCount === 0) {
          toast('No new wallets were restored. All wallets already exist.');
        } else {
          toast.success(`${restoredSolanaCount + restoredEthereumCount} wallets restored successfully.`);
        }
      } catch (error) {
        console.error("Failed to restore wallets:", error);
        toast.error(`Restore failed: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  
    event.target.value = ''; // Reset the input value to allow re-uploading the same file if needed
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
                    <p>Please note that the password in old wallets and password in new wallets should match or the restore will fail.</p>
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
            <CardComponent image={data.type === 'solana' ? SolanaLogo : data.type === 'Ethereum' ? EthereumLogo : ''} BalanceAmountData={1.001} keysData={data} index={index} />
          </div>
        ))
      )}
    </div>
  );
};

export default Wallets;
