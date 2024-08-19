import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  Card,
  CardBody,
  Snippet,
  CardHeader,
  CardFooter,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { KeyGenerate } from './solKeyGen/KeyCommons';
import { encryptWallets, decryptWallets } from '../utils/cryptoUtils';
import { toast } from 'sonner';
import { copyToClipboard } from '../functions/Functions';
import { motion } from 'framer-motion';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import SolanaImage from '../ui/assets/images/solana.svg';
import { useTheme } from 'next-themes';
import { EyeSlashFilledIcon } from '../ui/icons/EyeSlashedFilledIcon';
import { EyeFilledIcon } from '../ui/icons/EyeFilledIcon';

type Props = {
  reqPass: string;
};

interface KeyGenerateResult {
  mnemonic: string;
  secretKey: string;
  publicKey: string;
}

interface WalletType {
  type: 'solana' | string;
  mnemonic: string;
  secretKey: string;
  publicKey: string;
  walletName: string;
}

const SOLANA_STORAGE_KEY = 'WlinkSolanaWallets';
const PASSWORD_STORAGE_KEY = 'wLinkSolPass';

const Solana = (props: Props) => {
  const { theme } = useTheme();
  const [state, setState] = useState(0);
  const [solValue, setSolValue] = useState('');
  const [keyValues, setKeyValues] = useState<KeyGenerateResult | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [walletName, setWalletName] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [visibility, setVisibility] = useState<{ [key: number]: { private: boolean; mnemonic: boolean } }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load wallets from local storage on component mount
  useEffect(() => {
    const storedWallets = localStorage.getItem(SOLANA_STORAGE_KEY);
    const password = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (storedWallets && password) {
      decryptWallets(storedWallets, password)
        .then((decryptedWallets) => {
          const solanaWallets = JSON.parse(decryptedWallets).filter((wallet: WalletType) => wallet.type === 'solana');
          setWallets(solanaWallets);
        })
        .catch((error) => {
          toast.error('Failed to decrypt wallets.');
          console.error('Decryption error:', error);
        });
    }
  }, []);

  const toggleVisibility = (index: number, field: 'private' | 'mnemonic') => {
    setVisibility((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: !prev[index]?.[field],
      },
    }));
  };

  const handleKeyGeneration = async () => {
    if (!walletName) {
      toast('Please enter a wallet name.');
      return;
    }
    const keys = KeyGenerate({ state, mnemonic: solValue });
    setState((prevState) => prevState + 1);

    if (keys) {
      const newWallet: WalletType = {
        type: 'solana',
        walletName,
        mnemonic: keys.mnemonic ?? '',  // Ensuring mnemonic is never undefined
        secretKey: keys.secretKey ?? '', // Ensuring secretKey is never undefined
        publicKey: keys.publicKey ?? '', // Ensuring publicKey is never undefined
      };

      setWallets((prevWallets) => {
        const updatedWallets = [...prevWallets, newWallet];
        const password = localStorage.getItem(PASSWORD_STORAGE_KEY);
        if (password) {
          encryptWallets(JSON.stringify(updatedWallets), password)
            .then((encryptedWallets) => {
              localStorage.setItem(SOLANA_STORAGE_KEY, encryptedWallets);
            })
            .catch((error) => {
              toast.error('Failed to encrypt wallets.');
              console.error('Encryption error:', error);
            });
        }
        return updatedWallets;
      });

      setKeyValues(keys);  // Set keyValues only if keys is not undefined
      toast('Wallet Generated');
    } else {
      toast.error('Failed to generate keys.');
    }

    setWalletName('');
  };

  const handleCopyClick = (value: string) => {
    copyToClipboard(value);
    toast('Copied');
  };

  const handleDelete = () => {
    const password = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (deleteIndex !== null && password) {
      decryptWallets(localStorage.getItem(SOLANA_STORAGE_KEY)!, password)
        .then((decryptedWallets) => {
          const walletArray = JSON.parse(decryptedWallets);
          const updatedWallets = walletArray.filter((_: any, index: number) => index !== deleteIndex);
          encryptWallets(JSON.stringify(updatedWallets), password)
            .then((encryptedWallets) => {
              localStorage.setItem(SOLANA_STORAGE_KEY, encryptedWallets);
              setWallets(updatedWallets);
              setDeleteIndex(null);
              onOpenChange();
            })
            .catch((error) => {
              toast.error('Failed to encrypt wallets after deletion.');
              console.error('Encryption error:', error);
            });
        })
        .catch((error) => {
          toast.error('Failed to decrypt wallets for deletion.');
          console.error('Decryption error:', error);
        });
    }
  };

  const handleDownloadWallet = async (wallet: WalletType) => {
    const password = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!password) {
      toast.error('No password found in local storage.');
      return;
    }

    try {
      const walletsArray = [wallet];
      const encryptedWallet = await encryptWallets(JSON.stringify(walletsArray), password);
      const blob = new Blob([encryptedWallet], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallet.walletName || 'wallet'}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Wallet downloaded successfully!');
    } catch (error) {
      toast.error('Failed to encrypt wallet for download.');
      console.error('Encryption error:', error);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="text-4xl font-semibold col-span-4">Solana Wallet Generator</div>
      <div className="col-span-3 flex items-center">
        <Input
          label="Type your mnemonic here to generate a wallet or leave it blank"
          variant="underlined"
          radius="md"
          size="lg"
          className="flex-1"
          onChange={(e) => setSolValue(e.target.value)}
        />
        <Input
          isRequired
          label="Wallet Name"
          variant="underlined"
          radius="md"
          size="lg"
          className="flex-1 ml-4"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
        />
        <div className="col-span-1 flex items-center justify-center">
          <Button color="primary" onClick={handleKeyGeneration}>
            Generate
          </Button>
        </div>
      </div>
      <div className="mt-5" />
      {keyValues?.mnemonic &&
        keyValues.mnemonic.split(' ').map((data, index) => (
          <motion.div key={index} variants={itemVariants} initial="hidden" animate="visible">
            <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-violet-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
              <CardBody className="p-4">
                <p className="text-gray-700 dark:text-gray-300">{index + 1}.</p>
                <p className="flex items-center justify-center text-gray-900 dark:text-gray-100">{data}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}

      {keyValues?.mnemonic && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full">
          <Snippet
            color="default"
            tooltipProps={{ content: 'Copy mnemonics' }}
            copyButtonProps={{ onPress: () => handleCopyClick(keyValues.mnemonic) }}
            className="dark:text-white text-black"
          >
            Click here to copy mnemonic
          </Snippet>
        </motion.div>
      )}

      {wallets.map((data, index) => (
        <div className="col-span-4" key={index}>
          <Card className="relative p-4 rounded-lg shadow-md">
            <div
              className={`absolute inset-0 rounded-lg bg-gradient-to-r ${
                theme === 'dark' ? 'from-gray-800 via-purple-900 to-gray-800' : 'from-purple-50 via-blue-50 to-purple-50'
              } opacity-75`}
            />
            <CardHeader className="relative z-10 flex justify-between items-center">
              <div className="p-2 rounded-lg dark:bg-black bg-slate-300">
                <Image src={SolanaImage} alt="solanaLogo" width={100} height={100} />
              </div>
              <div className="font-semibold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-500 dark:to-blue-500">
                {data.walletName || `Solana Wallet ${index + 1}`}
              </div>
              <div className="flex justify-end">
                <Button
                  color="danger"
                  variant="bordered"
                  className="flex gap-2 items-center"
                  startContent={<Trash className="size-4 text-destructive" />}
                  onPress={() => {
                    setDeleteIndex(index);
                    onOpenChange();
                  }}
                >
                  Delete Wallet
                </Button>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="text-black dark:text-white">
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader>Delete Wallet?</ModalHeader>
                        <ModalBody>
                          <p>
                            Are you sure you want to delete this wallet? Make sure to download this wallet if you ever need to restore the
                            wallet.
                          </p>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="primary" onPress={onClose}>
                            No
                          </Button>
                          <Button color="danger" variant="light" onPress={() => handleDelete()}>
                            Delete
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </CardHeader>
            <CardBody className="relative z-10 text-black dark:text-white">
              <div>
                <Input label="Public Key" variant="underlined" type="text" readOnly value={data.publicKey} />
              </div>
              <div className="m-2" />
              <div>
                <Input
                  label="Private Key"
                  variant="underlined"
                  type={visibility[index]?.private ? 'text' : 'password'}
                  readOnly
                  value={data.secretKey}
                  endContent={
                    <button className="focus:outline-none" type="button" onClick={() => toggleVisibility(index, 'private')} aria-label="toggle password visibility">
                      {visibility[index]?.private ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
              </div>
              <div className="m-2" />
              <div>
                <Input
                  label="Secret Phrase"
                  variant="underlined"
                  type={visibility[index]?.mnemonic ? 'text' : 'password'}
                  readOnly
                  value={data.mnemonic}
                  endContent={
                    <button className="focus:outline-none" type="button" onClick={() => toggleVisibility(index, 'mnemonic')} aria-label="toggle password visibility">
                      {visibility[index]?.mnemonic ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
              </div>
            </CardBody>
            <CardFooter className="relative z-10 text-black dark:text-white">
              <Button color="primary" onPress={() => handleDownloadWallet(data)}>
                Download Wallet
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default Solana;
