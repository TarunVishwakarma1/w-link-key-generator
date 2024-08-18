import React from "react";
import { Card, CardBody, Button, Tooltip,CardHeader } from "@nextui-org/react";
import { PauseCircleIcon } from "../../icons/PauseCircleIcon";
import Image from "next/image";
import { Key, Landmark, Lock, SendIcon } from "lucide-react";

export default function CardComponent({ image, BalanceAmountData,keysData,index }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <Card
      isBlurred
      className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px] text-black dark:text-white"
      shadow="lg"
    >
      <CardHeader className="grid grid-cols-3 justify-between">
        <Image
          alt="SolLogo"
          className="object-cover"
          height={20}
          width={20}
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
              onPress={() => setLiked((v) => !v)}
            >
              <Key/>
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
              onPress={() => setLiked((v) => !v)}
            >
              <Lock/>
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
              onPress={() => setLiked((v) => !v)}
            >
              <SendIcon/>
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
              onPress={() => setLiked((v) => !v)}
            >
              <Landmark/>
            </Button>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
}
