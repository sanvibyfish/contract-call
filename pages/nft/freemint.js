import { Box, Button, Heading,Badge,Image, useToast, Link } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'

export default function FreeMint() {
  const [freeMintList, setFreeMintList] = useState([])
  const [isFetchLoading, setFetchtisLoading] = useState()
  const toast = useToast()

  const [refreshCount, setRefreshCount] = useState(0)
  const handleUpdate = useCallback(
    () => {
      setRefreshCount((prevState) => prevState + 1)
      setFetchtisLoading(true)
    },
    [])

  const loadBlockFreeMint = async () => {
    try{
      // Call an external API endpoint to get posts
      const res = await fetch('/api/hello')
      const data = await res.json()
      return data
    }catch(e) {
      console.log(e)
      toast({
        title: '调用失败',
        description: e.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadBlockFreeMint()
      setFreeMintList([data,...freeMintList])
      setFetchtisLoading(false)
    }

    fetchData()
  }, [refreshCount])

  return (
    <div className="flex">
      <div className="w-1/2 flex flex-col">
        <Button onClick={handleUpdate} isLoading={isFetchLoading}>刷新</Button>
        {
          freeMintList && freeMintList.map((freeMint,i) => {
            return (
              <Box p={5} shadow='md' borderWidth='1px' key={`box${i}`}>
              <Heading as='h4' size='md' key={`heading${i}`}>Block {freeMint.blockNumber}</Heading>
              {
                freeMint.result && freeMint.result.map((item,j) => {
                  return (
                    <div className="flex p-2" key={`item${j}`} >
                      <Image key={`item-img-${j}`}
                      className="p-2"
                        borderRadius='full'
                        boxSize='64px'
                        src={item.image}
                      />
                      <div className="flex flex-col pt-2"  key={`item-detail-${j}`}>
                        <div className="flex"  key={`item-detail-div-${j}`}>
                          <h1 className="text-lg font-bold"  key={`item-detail-name-${j}`}> <Link href={item.etherscan}>{item.name}</Link></h1>
                          <Badge  key={`item-detail-amount-${j}`}>x {item.amount}</Badge>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </Box>
            )
          })
        }

      </div>
      <div className="w-1/2" />
    </div>
  )
}