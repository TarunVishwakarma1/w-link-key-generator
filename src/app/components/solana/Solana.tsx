import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardBody, Snippet, CardHeader, CardFooter, useDisclosure, Modal, ModalHeader,
  ModalContent, ModalBody, ModalFooter } from '@nextui-org/react';
import { KeyGenerate, encryptValue } from './solKeyGen/KeyCommons';
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
  walletName: string; // Added walletName field
}

const LOCAL_STORAGE_KEY = "WlinkSolanaWallets";

const Solana = (props: Props) => {
  const { theme } = useTheme();
  const [state, setState] = useState(0);
  const [solValue, setSolValue] = useState('');
  const [keyValues, setKeyValues] = useState<KeyGenerateResult>();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [walletName, setWalletName] = useState(''); // Added walletName state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [visibility, setVisibility] = useState<{ [key: number]: { private: boolean; mnemonic: boolean } }>({});

  // Load wallets from local storage on component mount
  useEffect(() => {
    const storedWallets = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedWallets) {
      setWallets(JSON.parse(storedWallets));
    }
  }, []);

  const toggleVisibility = (index: number, field: 'private' | 'mnemonic') => {
    setVisibility(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: !prev[index]?.[field]
      }
    }));
  };

  const handleKeyGeneration = () => {

    if(!walletName){
      toast('Please enter wallet name');
      return;
    }
    const keys = KeyGenerate({ state, mnemonic: solValue });
    toast("Wallet Generated");
    setState(state => state + 1);
    setKeyValues(keys);

    setWallets(prevWallets => {
      const updatedWallets = [...prevWallets, { ...keys, type: 'solana', walletName }];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWallets));
      return updatedWallets;
    });

    setWalletName(''); // to handle generation of wallet if wallet name is null
  };

  const handleCopyClick = (value: string) => {
    copyToClipboard(value);
    toast('Copied');
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      setWallets(prevWallets => {
        const updatedWallets = prevWallets.filter((_, index) => index !== deleteIndex);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWallets));
        return updatedWallets;
      });
      setDeleteIndex(null);
      onOpenChange();
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="text-4xl font-semibold col-span-4">
        Solana Wallet Generator
      </div>
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
          onChange={(e) => setWalletName(e.target.value)} // Added Wallet Name input
        />
        <div className="col-span-1 flex items-center justify-center">
          <Button color="primary" onClick={handleKeyGeneration}>
            Generate
          </Button>
        </div>
      </div>
      <div className='mt-5' />
      {keyValues?.mnemonic && keyValues.mnemonic.split(' ').map((data, index) => (
        <motion.div key={index} variants={itemVariants} initial="hidden" animate="visible">
          <Card
            className="bg-gradient-to-r from-pink-50 via-purple-50 to-violet-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
            <CardBody className="p-4">
              <p className="text-gray-700 dark:text-gray-300">{index + 1}.</p>
              <p className="flex items-center justify-center text-gray-900 dark:text-gray-100">{data}</p>
            </CardBody>
          </Card>
        </motion.div>
      ))}

      {keyValues?.mnemonic && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full">
          <Snippet color="default" tooltipProps={{ content: "Copy mnemonics" }}
            copyButtonProps={{ onPress: () => handleCopyClick(keyValues.mnemonic) }}
            className="dark:text-white text-black">
            Click here to copy mnemonic
          </Snippet>
        </motion.div>
      )}

      {wallets.map((data, index) => (
        <div className='col-span-4' key={index}>
          <Card className="relative p-4 rounded-lg shadow-md">
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${theme === 'dark'
              ? 'from-gray-800 via-purple-900 to-gray-800' : 'from-purple-50 via-blue-50 to-purple-50'
              } opacity-75`} />
            <CardHeader className="relative z-10 flex justify-between items-center">
              <div className="p-2 rounded-lg dark:bg-black bg-slate-300">
                <Image src={SolanaImage} alt="solanaLogo" width={100} height={100} />
              </div>
              <div
                className="font-semibold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-500 dark:to-blue-500">
                {data.walletName || `Solana Wallet ${index + 1}`} {/* Display walletName */}
              </div>
              <div className="flex justify-end">
                <Button color="danger" variant="bordered" className="flex gap-2 items-center" startContent={<Trash
                  className="size-4 text-destructive" />}
                  onPress={() => {
                    setDeleteIndex(index);
                    onOpenChange();
                  }}
                >
                  Delete Wallet
                </Button>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='text-black dark:text-white'>
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader>
                          Delete Wallet?
                        </ModalHeader>
                        <ModalBody>
                          <p>Are you sure you want to delete this wallet? This action is not reversible and you will
                            lose access to your wallet.</p>
                          <p>Please make sure you have your keys and secret phrase with you for regeneration of the
                            wallet in the future.</p>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="primary" onPress={onClose}>
                            No
                          </Button>
                          <Button color="danger" variant='light' onPress={() => { handleDelete(); onClose(); }}>
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
                  <Input label='Public Key' variant='underlined' type='text' readOnly value={data.publicKey} />
                </div>
                <div className='m-2' />
                <div>
                  <Input label='Private Key' variant='underlined' type={visibility[index]?.private ? "text" : "password"
                    } readOnly value={data.secretKey} endContent={ <button className="focus:outline-none" type="button"
                    onClick={() => toggleVisibility(index, 'private')}
                  aria-label="toggle password visibility"
                  >
                  {visibility[index]?.private ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                  </button>
                  }
                  />
                </div>
                <div className='m-2' />
                <div>
                  <Input label='Secret Phrase' variant='underlined' type={visibility[index]?.mnemonic ? "text"
                    : "password" } readOnly value={data.mnemonic} endContent={ <button className="focus:outline-none"
                    type="button" onClick={() => toggleVisibility(index, 'mnemonic')}
                  aria-label="toggle password visibility"
                  >
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
                Copy
              </CardFooter>
            </Card>
          </div>
        ))}
    </div>
  );
};

export default Solana;
