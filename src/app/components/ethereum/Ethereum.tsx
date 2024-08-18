import React from 'react'
import {Input,Button} from "@nextui-org/react";
type Props = {}

const Ethereum = (props: Props) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="text-4xl font-semibold col-span-4">
        Ethereum Wallet Generator
      </div>
      <div className="col-span-3 flex items-center">
        <Input 
          label="Type your mnemonic here to generate a wallet or leave it blank" 
          variant="underlined"
          radius="md"
          size="lg"
          className="flex-1"
        />
        <div className="col-span-1 items-center justify-center flex flex-2">
          <Button 
            color="primary"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Ethereum