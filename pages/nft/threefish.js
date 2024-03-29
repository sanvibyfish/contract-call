import { Text, Button, Select, Heading, Badge, Image, useToast, Link } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { useContractWrite, useAccount, useFeeData,useContractRead, useConnect, useDisconnect } from 'wagmi'
import { useForm, SubmitHandler } from "react-hook-form";
import { ethers } from 'ethers';
export default function ThreeFish() {
  const toast = useToast()
  const [amount, setAmount] = useState(0)
  const [totalMinted, setTotalMinted] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [accountMinted, setAccountMinted] = useState(0);


  const abi = [
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },	
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        }
      ],
      "name": "numberMinted",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "collectionSize",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  const { data:feeData } = useFeeData()
  const contractAddr = '0xA2c733a7ED0363e5abFdC0D829bb0b07483EFC94';
  const { data: totalSupplyData, refetch, isSuccess: readSuccess,isLoading: readIsLoading, isError: isReadError } = useContractRead(
    {
      address: contractAddr,
      abi: abi,
      functionName: 'totalSupply'
    },
    {
      onError(error) {
        toast({
          title: '调用失败',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      },
    }
  );

  // const { data: totalSupplyData, refetch, isSuccess: readSuccess,isLoading: readIsLoading, isError: isReadError } = useContractRead(
  //   {
  //     address: contractAddr,
  //     abi: abi,
  //     functionName: 'tokenUrl'
  //   },
  // );


  // const { data: account} = useAccount()
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data: numberMinted } = useContractRead(
    {
      address: contractAddr,
      abi: abi,
      functionName:"numberMinted",
      args: [address]
    }
  );
  
   const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
   const onSubmit = data => console.log(data);
  const { data, isError: isContractWriteError, isLoading, isSuccess, write } = useContractWrite(
    {
      address: contractAddr,
      abi: abi,
      functionName: "mint",
      args: [amount],
      overrides: {
        value: accountMinted == 0 ? ethers.utils.parseEther(`${0.01 * (amount - 1)}`) : ethers.utils.parseEther(`${0.01 * amount}`),
        type: 0
      },
      onError(error) {
        toast({
          title: '调用失败',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      },
    },
  )


  useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);


  useEffect(() => {
    if (feeData) {
      setGasPrice(feeData.gasPrice);
    }
  }, [feeData]);

  useEffect(() => {
    if (numberMinted) {
      setAccountMinted(numberMinted.toNumber());
    }
  }, [numberMinted]);



  useEffect(()=>{
    console.log(amount)
    if(amount != 0) {
      write()
    }
  },[amount])
  

  return (
    <div className="flex pt-32 pb-32">
      <div className="flex flex-col w-1/2">
        <Heading>zkSync Era Netowrk NFT</Heading>
        <Heading> First Free Mint </Heading>
        <p>Then 0.01 ETH </p>
        <p>Max 5</p>
      </div>
      <div className="w-1/2">
        <form onSubmit={handleSubmit((data)=>{
            setAmount(data.amount)
        })}>
          <div className="flex">
            <Select {...register('amount')} placeholder='Amount' >
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
              <option value='4'>4</option>
              <option value='5'>5</option>
            </Select>
            <Button colorScheme='blue'  type="submit" >Mint</Button>
          </div>
        </form>
        <div className="text-5xl flex"> {totalMinted} / 667</div>
        <div className='flex'>
          <img src="https://bafybeiam4u2ejfbdism3e2wowmezy2l5whcgkmydi7ibftqpjx5cxsqhhe.ipfs.nftstorage.link/0.png" width={256} height={256}></img>
          <img src="https://bafybeiam4u2ejfbdism3e2wowmezy2l5whcgkmydi7ibftqpjx5cxsqhhe.ipfs.nftstorage.link/100.png" width={256} height={256}></img>
          <img src="https://bafybeiam4u2ejfbdism3e2wowmezy2l5whcgkmydi7ibftqpjx5cxsqhhe.ipfs.nftstorage.link/200.png" width={256} height={256}></img>
        </div>
      </div>


    </div>
  )

}