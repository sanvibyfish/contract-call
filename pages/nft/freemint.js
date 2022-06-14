import { Box, Button, Heading,Badge,Image } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
export async function loadBlockFreeMint() {
  // Call an external API endpoint to get posts
  const res = await fetch('/api/hello')
  const data = await res.json()
  return data
}


export default function FreeMint() {
  const [freeMintList, setFreeMintList] = useState([])
  const [isFetchLoading, setFetchtisLoading] = useState()

  const [refreshCount, setRefreshCount] = useState(0)
  const handleUpdate = useCallback(
    () => {
      setRefreshCount((prevState) => prevState + 1)
      setFetchtisLoading(true)
    },
    [])

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadBlockFreeMint()
      setFreeMintList([...freeMintList, data])
      setFetchtisLoading(false)
    }

    fetchData()
  }, [refreshCount])

  return (
    <div className="flex">
      <div className="w-1/2 flex flex-col">
        <Button onClick={handleUpdate} isLoading={isFetchLoading}>刷新</Button>
        {
          freeMintList && freeMintList.map((freeMint) => {
            return (
              <Box p={5} shadow='md' borderWidth='1px'>
              <Heading as='h4' size='md'>Block {freeMint.blockNumber}</Heading>
              {
                freeMint.result && freeMint.result.map((item) => {
                  return (
                    <div className="flex p-2" >
                      <Image
                      className="p-2"
                        borderRadius='full'
                        boxSize='64px'
                        src={item.image}
                      />
                      <div className="flex flex-col pt-2">
                        <div className="flex">
                          <h1 className="text-lg font-bold"> {item.name}</h1>
                          <Badge>x {item.amount}</Badge>
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