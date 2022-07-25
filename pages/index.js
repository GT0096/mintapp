import Head from 'next/head'
import {useState} from 'react'
import {create} from 'ipfs-http-client'
import styles from '../styles/Home.module.css'

// ========================================================
// imp packages
import { createRaribleSdk } from "@rarible/sdk"
import Web3 from 'web3'
import {Web3Ethereum} from '@rarible/web3-ethereum'
import ethers from 'ethers'
import { useEffect } from 'react'
// import {createCollection} from '@rarible/sdk/build/sdk-blockchains/ethereum/create-collection'
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toCollectionId, toContractAddress, toUnionAddress } from "@rarible/types"
import { MintType } from "@rarible/sdk/build/types/nft/mint/domain"




const client = create('https://ipfs.infura.io:5001/api/v0')
console.log(client)




// ====================================================================


export default function Home() {
// ==========================================================================
const [account, setAccount] = useState()
const [sdk, setSdk] = useState()
const [contractAddress, setContractAddress] = useState()
const [metaUrl, setMetaUrl]  = useState()


// ==========================================================================
//  Initialising SDK
 function initiateSdk() {
 
const { ethereum } = window 

// await provider.request({ method: "eth_requestAccounts" })
if (ethereum && ethereum.isMetaMask){
setAccount(ethereum['selectedAddress']);
console.log('Ethereum successfully detected!', account)
const web3 = new Web3(ethereum)
const web3Ethereum = new Web3Ethereum({ web3 })
const ethWallet = new EthereumWallet(web3Ethereum)
// const env = "dev" // "e2e" | "ropsten" | "rinkeby" | "mainnet"
const raribleSdk = createRaribleSdk(ethWallet, "dev")
setSdk(raribleSdk);
console.log(raribleSdk.apis.collection.getCollectionById)
console.log(web3.eth.getAccounts());
}else {
  console.log('Please install MetaMask!')
}
}


useEffect(()=> {

  if ((window).ethereum){
    initiateSdk()

  }else{
    window.addEventListener('ethereum#initialized', initiateSdk, {
      once: true,
    })
    setTimeout(initiateSdk, 3000)
  }
    },[])

// ============================================================
// create collection
const [imgPath, setImgPath] = useState({});
    async function CreateCollection() {

    const ethereumRequest = {
      blockchain:"ETHEREUM",
      asset: {
        assetType: "ERC721",
        arguments: {
          name: "name",
          symbol: "RARI",
          baseURI: "https://ipfs.infura.io",
          contractURI: `https://ipfs.infura.io/ipfs/${imgPath}`,
          isUserToken: false,
        },
      },
    }
    try {
      const result = await sdk.nft.instances.ETHEREUM.createCollection(ethereumRequest)
      console.log(result)
      await result.tx.wait()
      // console.log(result.tx.blockchain, result.tx.transaction.hash)
      setContractAddress(result.address);
      return result.address
      
    } catch (error) {
      console.log(error)
    }
      
  }


// ==========================================================
// minting nft
async  function mintNft(e) {

  const collectionAddress = contractAddress.split(':')[1];
  console.log(collectionAddress)

  try {
    const mintAction =  await sdk.nft.mint({
      collectionId:toCollectionId(`ETHEREUM:${collectionAddress}`)
    })
    const mintResult = await mintAction.submit({
  uri:metaUrl,
  royalties: [],
lazyMint: true,
supply: 1,
})
console.log(mintResult)
if (mintResult.type === MintType.OFF_CHAIN) {
return console.log(mintResult.itemId)
}
  } catch (error) {
    console.log(error)
  }
// =======Using sdk to generate token====
// const token = await sdk.nft.generateTokenId({
//   collection: toUnionAddress(
//         "ETHEREUM:0xa9c205c0ccbe7566a3f73c63322c5c2075c0093c"
//       ),
//       minter: toUnionAddress(
//         "ETHEREUM:0x79Ea2d536b5b7144A3EabdC6A7E43130199291c0"
//       ),
// })
// console.log(token)
// ========Using api to generate token id
// const raribleTokenIdUrl = `https://ethereum-api-dev.rarible.com/protocol/v0.1/ethereum/nft/collections/"ETHEREUM:0xB66a603f4cFe17e3D27B87a8BfCaD319856518B8"/generate_token_id?minter=${account}`;
// const res = await fetch(raribleTokenIdUrl).then((res) => console.log(res.json()));


}







  // ==================================================
  //file Handling part
  // const [account, setAccount] = useState(null)
  const [file, setFile] = useState(null)
  const [createObjectURL, setCreateObjectURL] = useState('');
  






const fileSelectHandler = (e) => {
  const i = e.target.files[0];
  setFile(i);
  console.log(i)
 
  console.log(URL.createObjectURL(i))
  setCreateObjectURL(URL.createObjectURL(i));
  console.log(URL.createObjectURL(i));
  

} 
console.log(file)
console.log(createObjectURL)
 const [formValue, setFormValue] = useState({
  name:"",
  desc: "",
 });
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormValue((prevState) =>{
      return {
        ...prevState,
        [name] : value,
      };
    });
    console.log(formValue);
     };

// =====================================================
// uploading data to ipfs

  const updateForm = async (e) => {
    e.preventDefault();

    try {
  const  added = await client.add(file)
  console.log(added)
  setImgPath(added.path)
  const url = `https://ipfs.infura.io/ipfs/${added.path}`
  console.log(url);


  const metadata = JSON.stringify({
    "name": formValue.name,
    "description": formValue.desc,
    "image":url,
    "external_url":`https://rinkeby.rarible.com/token/${account}:18`,
    "attributes":[],
    })
    console.log(metadata)

 const metaObj = await client.add(metadata)
 console.log(metaObj);
 const metaUrl = `https://myraahw3s.io/ipfs/${metaObj.path}`
 setMetaUrl(metaUrl)
  console.log(metaUrl)



    }catch (error) {
  console.log('Error uploading', error)
}

// const raribleTokenIdUrl = `https://ethereum-api-dev.rarible.com/protocol/v0.1/ethereum/nft/collections/${contractAddress}/generate_token_id?minter=${account}`;
// const res = await fetch(raribleTokenIdUrl).then((res) => console.log(res.json()));

}





const loadMetamask = async () => {
  // You need to await for user response on the metamask popup dialog
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  if(accounts){
    setAccount(accounts[0])
     console.log(accounts[0]);
  }
}

const makeDir = async ()=> {
  try {
    // const mkdir = await client.files.mkdir('/file2')
    const stat = await client.files.stat('/file2')
    // console.log("file is ",mkdir)
    console.log("stat is",stat)
  } catch (error) {
    console.log(error)
  }
}


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

  <form   method="post">
  <label>Name:</label>
  <input type="text" id="first" name="name" onChange={handleChange} />
  <label>Description:</label>
  <textarea id="last" name="desc" onChange={handleChange}/>
  <input type="file"  name='file' onChange={fileSelectHandler}
/>
  <button type="submit" onClick={updateForm}>Submit</button>
  
</form>
<div>
  <img src={createObjectURL} alt="img" width={200} height={200} />
  </div>

  <div>
     
     <h2>{account}</h2>
         <button
           onClick={()=>loadMetamask()}
         >Connect to Metamask</button>
 
     </div>
<div>
<button type='submit' onClick={CreateCollection} >createCollection</button>
<div>
  <button type='submit' onClick={mintNft}>Mint</button>
  <button type='submit' onClick={makeDir}>Make File</button>
</div>
</div>
      
    </div>
  )
}
