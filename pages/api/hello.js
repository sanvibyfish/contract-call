import { ethers } from "ethers"
import axios from 'axios';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {
  const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/c_GY7IIDN7G7hNX_qyq59KbYTjKvhJLR');
  // const provider = new ethers.providers.JsonRpcProvider('https://mainnet-eth.compound.finance/');
  const number = await provider.getBlockNumber();
  const sourceTxs = await provider.getBlockWithTransactions(number)
  const sourceTxsMap = new Map()
  sourceTxs.transactions.map((item) => {
    sourceTxsMap.set(item.hash, item)
  })
  const resp = await axios
    .post('https://eth-mainnet.alchemyapi.io/v2/c_GY7IIDN7G7hNX_qyq59KbYTjKvhJLR',
      { "jsonrpc": "2.0", "id": 1, "method": "eth_getBlockReceipts", "params": [number] }
    );
  const transactions = resp.data.result;
  let contractMap = new Map()
  let result = []
  var i = 0;
  while(i < transactions.length){
    try{
      const transcation = transactions[i]
      if (transcation.to && sourceTxsMap.get(transcation.transactionHash).value.toString() == '0') {
        // 判断是否erc721
        if (transcation.logs.length > 0 && transcation.logs[0].topics.length == 4 && transcation.logs[0].topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
          const amount = transcation.logs.length
          var collection = {};
          if (!contractMap.get(transcation.to)) {
            const abi = [
              { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
              {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                  }
                ],
                "name": "tokenURI",
                "outputs": [
                  {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
            ]
            const contr = new ethers.Contract(transcation.to, abi, provider);
            const name = await contr.name();
            var tokenURI = await contr.tokenURI(Number(transcation.logs[0].topics[3]));
            if (tokenURI.startsWith('ipfs')) {
              tokenURI = tokenURI.replace('ipfs://', "https://ipfs.io/ipfs/")
            }
            const nftJSON = await axios
              .get(tokenURI);
            var image = nftJSON.data.image;
            if (image.startsWith('ipfs')) {
              image = image.replace('ipfs://', "https://ipfs.io/ipfs/")
            }
            collection = {
              name: name,
              image: image
            }
            contractMap.set(transcation.to, collection)
  
          } else {
            collection = contractMap.get(transcation.to)
          }
          result.push({
            name: collection?.name,
            image: collection?.image,
            amount: amount,
            etherscan: `https://etherscan.io/address/${transcation.to}`
          })
        }
      }
      i++;
    }catch(e) {
      console.log(e)
      res.status(500).json({ message: e.toString() })
      break;
    }
   
  }
  res.status(200).json({ blockNumber: number, result: result })
}
