import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, Button, Tooltip, CardHeader, Textarea, Input } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,Pagination } from "@nextui-org/react";
import Image from "next/image";
import { Key, Landmark, Lock, SendIcon } from "lucide-react";
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';
import { fetchTransactionHistory } from "@/app/components/utils/transactionUtils";

export default function CardComponent({ image, keysData, index }) {
  const [modalHeader, setModalHeader] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [passValue, setPassValue] = useState('');
  const [pkData, setpkData] = useState('');
  const [amountToSend, setAmountToSend] = useState(0.00);
  const [balanceAmountData, setBalanceAmountData] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [recipientAddress, setRecipientAddress] = useState('');

  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     try {
  //       const response = await axios.post('/api/fetchBalance', {
  //         publicKey: keysData.publicKey,
  //         type: keysData.type
  //       });

  //       let balance = 0;

  //       if (keysData.type === 'solana') {
  //         const lamports = response.data.result.value;
  //         balance = lamports / 1_000_000_000; // Convert lamports to SOL
  //       } else if (keysData.type === 'ethereum') {
  //         const wei = parseInt(response.data.result, 16); // Convert hex to decimal
  //         balance = wei / 1_000_000_000_000_000_000; // Convert wei to ETH
  //       }

  //       setBalanceAmountData(balance);
  //     } catch (error) {
  //       console.error("Error fetching balance:", error.response ? error.response.data : error.message);
  //       toast('Failed to fetch balance');
  //     }
  //   };

  //   fetchBalance();
  //   const intervalId = setInterval(fetchBalance, 5000); // Fetch every 5 seconds

  //   return () => clearInterval(intervalId);
  // }, [keysData.publicKey, keysData.type]);   

  const handleOpenModalClickPublicKey = (header, data) => {
    setModalHeader(header);
    setModalBody(<Textarea value={data} />);
    onOpen();
  };

  const handleCheckPassword = () => {
    if (!passValue) {
      toast('No Password is provided');
      return;
    }
    const hashedPass = hashPassword(passValue);
    const storedPass = localStorage.getItem('wLinkSolPass');

    if (storedPass) {
      if (hashedPass === storedPass) {
        setModalBody(<Textarea value={pkData} />);
      } else {
        toast('Wrong Password! Try Again');
      }
    } else {
      toast('No password set in local storage');
    }
  };

  const handleKeyDown = (onClose, e) => {
    if (e.key === 'Enter') {
      handleCheckPassword();
    }
  };

  const handleOpenModalClickPrivateKey = (keyName, keyValue) => {
    setpkData(keyValue);
    setModalHeader("Private key");
    setModalBody('');
    onOpen();
  };

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const handleOpenModalClickSendMoney = (modalHeader, modalBody) => {
    setModalHeader(modalHeader);
    setModalBody(modalBody);
    onOpen();
  };

  const handleOpenModalClickSeeTransaction = async (modalHeader) => {
    setModalHeader(modalHeader);
    setModalBody('Loading transactions...');
  
    onOpen();
  
    try {
      const transactions = await fetchTransactionHistory(keysData.publicKey, keysData.type);
  
      if (transactions.length === 0) {
        setModalBody(<p>No transactions found.</p>);
      } else if (transactions.length > 5) {
        let currentPage = 1;
        const itemsPerPage = 5;
        const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
        const paginate = (pageNumber) => {
          const startIndex = (pageNumber - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          return transactions.slice(startIndex, endIndex);
        };
  
        setModalBody(
          <div>
            <ul>
              {paginate(currentPage).map((tx, index) => (
                <li key={index}>
                  <pre>{JSON.stringify(tx, null, 2)}</pre>
                </li>
              ))}
            </ul>
            <Pagination
              total={totalPages}
              initialPage={currentPage}
              onChange={(page) => {
                currentPage = page;
                setModalBody(
                  <div>
                    <ul>
                      {paginate(currentPage).map((tx, index) => (
                        <li key={index}>
                          <pre>{JSON.stringify(tx, null, 2)}</pre>
                        </li>
                      ))}
                    </ul>
                    <Pagination
                      total={totalPages}
                      initialPage={currentPage}
                      onChange={(page) => {
                        currentPage = page;
                      }}
                    />
                  </div>
                );
              }}
            />
          </div>
        );
      } else {
        setModalBody(
          <div>
            <ul>
              {transactions.map((tx, index) => (
                <li key={index}>
                  <pre>{JSON.stringify(tx, null, 2)}</pre>
                </li>
              ))}
            </ul>
          </div>
        );
      }
    } catch (error) {
      setModalBody('Failed to load transactions.');
      console.error("Error fetching transactions:", error);
    }
  };

  const handleSendAmount = async () => {
    if (amountToSend <= balanceAmountData && amountToSend > 0) {
      if (!recipientAddress) {
        toast('Please enter a recipient address');
        return;
      }

      let success = false;

      if (keysData.type === 'solana') {
        success = await sendSolana(keysData.secretKey, recipientAddress, amountToSend);
      } else if (keysData.type === 'Ethereum') {
        success = await sendEthereum(keysData.secretKey,recipientAddress, amountToSend);
      }

      if (success) {
        onClose();
      }
    } else if (amountToSend <= 0) {
      toast('Please enter a valid amount');
    } else {
      toast('Cannot send more than the available balance');
    }
  };

  return (
    <>
      <Card
        isBlurred
        className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px] text-black dark:text-white"
        shadow="md"
        key={index}
      >
        <CardHeader className="grid grid-cols-3 justify-between">
          <Image
            alt="SolLogo"
            className="object-cover"
            height={15}
            width={15}
            src={image}
          />

          <div className="justify-center items-center flex col-start-2">
            {keysData.walletName}
          </div>
        </CardHeader>
        <CardBody className="grid grid-cols-5 gap-2">
          <div className="col-span-1 flex items-center justify-center">
            <Tooltip
              content='Public key'
              color="default"
              showArrow
              delay={500}
              closeDelay={0}
              className="text-black dark:text-white"
            >
              <Button
                isIconOnly
                className="-translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                onPress={() => handleOpenModalClickPublicKey('Public Key', keysData.publicKey)}
              >
                <Key />
              </Button>
            </Tooltip>
          </div>
          <div className="col-span-3 col-start-2 border-b-slate-400 border-1 h-16 w-full relative rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-tiny">Current Balance</div>
              <div>{balanceAmountData} {keysData.type === 'solana' ? 'SOL' : 'ETH'}</div>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <Tooltip
              content='Private key'
              color="default"
              showArrow
              delay={500}
              closeDelay={0}
              className="text-black dark:text-white"
            >
              <Button
                isIconOnly
                className="-translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                color="danger"
                onPress={() => handleOpenModalClickPrivateKey('Private key', keysData.secretKey)}
              >
                <Lock />
              </Button>
            </Tooltip>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <Tooltip
              content='Send amount'
              color="default"
              showArrow
              delay={500}
              closeDelay={0}
              className="text-black dark:text-white"
            >
              <Button
                isIconOnly
                className="-translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                color="primary"
                onPress={() => handleOpenModalClickSendMoney('Send Amount', 'Demo')}
              >
                <SendIcon />
              </Button>
            </Tooltip>
          </div>
          <div className="col-start-5 col-span-1 flex items-center justify-center">
            <Tooltip
              content='See transactions history'
              color="default"
              showArrow
              delay={500}
              closeDelay={0}
              className="text-black dark:text-white"
            >
              <Button
                isIconOnly
                className="-translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                color="success"
                onPress={() => handleOpenModalClickSeeTransaction('Transaction history', 'Transactions')}
              >
                <Landmark />
              </Button>
            </Tooltip>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark:text-white text-black">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 break-words">{modalHeader}</ModalHeader>
              <ModalBody className="break-words">
                {modalHeader === "Private key" && (
                  <>
                    <Input
                      type="password"
                      onValueChange={setPassValue}
                      variant="underlined"
                      label="Password"
                      onKeyDown={(e) => handleKeyDown(onClose, e)}
                    />
                    <Button onPress={() => handleCheckPassword()}>Show Key</Button>
                    <div>{modalBody}</div>
                  </>
                )}
                {modalHeader === 'Public Key' && 
                  <div>{modalBody}</div>
                }
                {modalHeader === 'Send Amount' && (
                  <>
                    <div>Available amount</div>
                    <div>{balanceAmountData} {keysData.type === 'solana' ? 'SOL' : 'ETH'}</div>
                    <div>Remaining Amount: {balanceAmountData - amountToSend} {keysData.type === 'solana' ? 'SOL' : 'ETH'}</div>
                    <div>
                      <Input
                        type="number"
                        label="Amount to send"
                        placeholder="0.00"
                        value={amountToSend}
                        onValueChange={(value) => {
                          let amount = parseFloat(value);
                          if (isNaN(amount) || amount < 0) {
                            amount = 0;
                          }
                          if (amount > balanceAmountData) {
                            toast('Amount exceeds available balance');
                            amount = amountToSend;
                          } else {
                            setAmountToSend(amount);
                          }
                        }}
                      />
                      <div className="mt-2">
                        <Input
                          type="text"
                          label="Recipient Address"
                          placeholder="Enter recipient public key"
                          value={recipientAddress}
                          onValueChange={setRecipientAddress}
                        />
                      </div>
                      {/* <div className="mt-2">
                        <Input
                          type="text"
                          label="Message"
                          placeholder="Type your message"
                          value={message}
                          onValueChange={setMessage}
                        />
                      </div> */}
                    </div>
                    <div>
                      <Button
                        color="success"
                        onPress={handleSendAmount}
                      >
                        Send
                      </Button>
                    </div>
                  </>
                )}
                {modalHeader === 'Transaction history' && (
                  <div>{modalBody}</div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
