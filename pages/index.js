import Head from 'next/head'
import Image from 'next/image'
import {
  SimpleGrid, Text, Alert, AlertIcon,
  Input, Textarea, Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button, Heading, Spinner,
  Box,
  Link,
  IconButton,
  useToast,
  useColorMode
} from '@chakra-ui/react'

// import { Input, Textarea, Spacer, Collapse, Text, useInput, Button, Grid } from '@nextui-org/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useForm, SubmitHandler } from "react-hook-form";
import { useContractWrite, useWaitForTransaction, useNetwork,useContractRead, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react';
import { etherscanBlockExplorers } from 'wagmi'
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export default function Home(props) {
  const toast = useToast()
  const { colorMode, toggleColorMode } = useColorMode()
  const [fnName, setFnName] = useState("")
  const [addrValue, setAddrValue] = useState("")
  const [abiValue, setAbiValue] = useState([])
  const [formData, setFormData] = useState()
  const [contractType, setContractType] = useState()
  const [number, setNumber] = useState()
  const [errMsg, setErrMsg] = useState("")
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const { register: sourceRegister, handleSubmit: sourceHandleSubmit, formState: { errors: sourceErrors } } = useForm();
  const { register: readRegister, handleSubmit: readHandleSubmit, formState: { errors: readErrors } } = useForm();


  const {
    isConnected
  } = useConnect()
  const { activeChain } = useNetwork()
  const { data, isError: isContractWriteError, isLoading, isSuccess, write } = useContractWrite(
    {
      addressOrName: addrValue,
      contractInterface: abiValue,
    },
    fnName?.f,
    {
      args: formData,
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
  const { isSuccess: txSuccess, isError: isWaitError } = useWaitForTransaction({
    hash: data?.hash,
    onError(error) {
      toast({
        title: '调用失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
    onSuccess(data) {
      toast({
        title: '调用成功',
        description: '你的交易已经完成',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
  });

  const { data: readData, refetch, isSuccess: readSuccess, isError: isReadError } = useContractRead(
    {
      addressOrName: addrValue,
      contractInterface: abiValue,
    },
    fnName?.f,
    {
      args: formData,
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

  useEffect(() => {
    if (fnName && contractType == 'write') {
      write()
    } else if(fnName && contractType == 'read'){
      refetch()
    }
  }, [formData, fnName,contractType]);

  return (
    <div className="container mx-auto">
      <main>
        <div className="flex flex-row justify-center">
          <div className="w-1/2 pt-6">
            {
              !txSuccess && data?.hash && (
                <Alert status='info' className="w-1/2">
                  <>
                    <Spinner />
                    等待中，
                    <Link isExternal href={`${activeChain?.blockExplorers.default.url}/tx/${data?.hash}`} >view on etherscan</Link>
                  </>
                </Alert>
              )
            }
            {
              (isContractWriteError || isWaitError) && errMsg && (
                <Alert status='error' className="w-1/2">
                  <AlertIcon />
                  {errMsg}
                </Alert>
              )
            }

          </div>
        </div>
        <div className="flex pt-12">
          <div className='flex flex-col pl-6 w-1/2'>
            <form key="form-source" onSubmit={sourceHandleSubmit((data) => {
              try {
                setAddrValue(data.addr)
                setAbiValue(data.abi)
              } catch (e) {
                console.log(e)
              }
            })}>
              <Input id='addr' key="addr" label="合约地址" placeholder='合约地址' {...sourceRegister('addr')} />
              <Textarea size="lg" label="合约ABI" placeholder='合约ABI' {...sourceRegister('abi')} className="mt-6 h-1/2" />
              <Button type="submit" className="mt-6">导入</Button>
            </form>
          </div>
          <div className="flex flex-col pl-12 w-1/2">
            <div className="">
              <Heading>Write</Heading>
              {
                abiValue && abiValue.length != 0 && (
                  <Accordion>
                    {
                      JSON.parse(abiValue).map((item, index) => {
                        if (item.stateMutability == 'nonpayable' && item.name) {
                          return (
                            <AccordionItem>
                              <h2>
                                <AccordionButton>
                                  <Box flex='1' textAlign='left'>
                                    {item.name}
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <form key={`form-${item.name}-${index}`} onSubmit={handleSubmit((data) => {
                                  try {
                                    for (const [key, value] of Object.entries(data)) {
                                      if (key == `${index}`) {
                                        setFormData(Object.values(value))
                                        break
                                      }
                                    }
                                    setFnName({ f: item.name })
                                    setContractType('write')
                                    setNumber(index)
                                  } catch (e) {
                                    console.log(e)
                                  }
                                })}>

                                  {
                                    item.inputs && (

                                      <SimpleGrid columns={[2, null, 3]} spacing='12px'>
                                        {
                                          item.inputs.map((input) => {
                                            return (
                                              <div className='flex flex-col'>
                                                <Text mb='8px'>{`${input.name}(${input.type})`}</Text>
                                                <Input key={`params-${input.name}-${index}`} placeholder={`${input.name}(${input.type})`}  {...register(`${index}.${input.name}`)} />
                                              </div>
                                            )
                                          })
                                        }
                                      </SimpleGrid>
                                    )
                                  }
                                  <Button key={index} value={index} type="submit" colorScheme='blue' isLoading={isLoading}
                                    loadingText='调用中……'
                                    variant='outline'>调用</Button>
                                </form>
                              </AccordionPanel>
                            </AccordionItem>
                          )
                        }
                      })
                    }
                  </Accordion>
                )
              }

            </div>
            <div className="pt-12">
              <Heading>Read</Heading>
              {
                abiValue && abiValue.length != 0 && (
                  <Accordion>
                    {
                      JSON.parse(abiValue).map((item, index) => {
                        if (item.stateMutability != 'nonpayable' && item.name) {
                          return (
                            <AccordionItem>
                              <h2>
                                <AccordionButton>
                                  <Box flex='1' textAlign='left'>
                                    {item.name}
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <form key={`form-${item.name}-${index}`} onSubmit={readHandleSubmit((data) => {
                                  try {
                                    for (const [key, value] of Object.entries(data)) {
                                      if (key == `${index}`) {
                                        setFormData(Object.values(value))
                                        break
                                      }
                                    }
                                    setFnName({ f: item.name })
                                    setContractType('read')
                                    setNumber(index)
                                  } catch (e) {
                                    console.log(e)
                                  }
                                })}>

                                  {
                                    item.inputs && (

                                      <SimpleGrid columns={[2, null, 3]} spacing='12px'>
                                        {
                                          item.inputs.map((input) => {
                                            return (
                                              <div className='flex flex-col'>
                                                <Text mb='8px'>{`${input.name}(${input.type})`}</Text>
                                                <Input key={`params-${input.name}-${index}`} placeholder={`${input.name}(${input.type})`}  {...readRegister(`${index}.${input.name}`)} />
                                              </div>
                                            )
                                          })
                                        }
                                      </SimpleGrid>
                                    )
                                  }
                                  <Button key={index} value={index} type="submit" colorScheme='blue' isLoading={isLoading}
                                    loadingText='调用中……'
                                    variant='outline'>调用</Button>
                                </form>
                                {
                                  number == index && (
                                    <Text>{readData?.toString()}</Text>
                                  )
                                }
                              </AccordionPanel>
                            </AccordionItem>
                          )
                        }
                      })
                    }
                  </Accordion>
                )
              }
            </div>
          </div>
        </div>


      </main>
    </div>
  )
}
