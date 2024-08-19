import { Card, CardBody, Button, Tooltip, CardHeader, Textarea, Input } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import Image from "next/image";
import { Key, Landmark, Lock, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

export default function CardComponent({ image, BalanceAmountData, keysData, index }) {
  const [modalHeader, setModalHeader] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [passValue, setPassValue] = useState('');
  const [pkData, setpkData] = useState('');
  const [amountToSend, setAmountToSend] = useState(0.00);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  const handleOpenModalClickSeeTransaction = (modalHeader, modalBody) => {
    setModalHeader(modalHeader);
    setModalBody(modalBody);
    onOpen();
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
              <div>{BalanceAmountData}</div>
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
                    <div>{BalanceAmountData}</div>
                    <div>Remaining Amount: {BalanceAmountData - amountToSend}</div>
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
                          if (amount > BalanceAmountData) {
                            toast('Amount exceeds available balance');
                            amount = amountToSend;
                          } else {
                            setAmountToSend(amount);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Button
                        color="success"
                        onPress={() => {
                          if (amountToSend <= BalanceAmountData && amountToSend > 0) {
                            onClose();
                          } else if (amountToSend <= 0) {
                            toast('Please enter a valid amount');
                          } else {
                            toast('Cannot send more than the available balance');
                          }
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </>
                )}
                {modalHeader === 'Transaction history' && (
                  <div>Transactions</div>
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
