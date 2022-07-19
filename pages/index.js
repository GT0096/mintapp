import Head from 'next/head'
import {useState} from 'react'
import {create} from 'ipfs-http-client'
import styles from '../styles/Home.module.css'

// ========================================================
// imp packages
import { createRaribleSdk } from "@rarible/sdk"
import Web3 from 'web3'
import {Web3Ethereum} from '@rarible/web3-ethereum'
import { useEffect } from 'react'
// import {createCollection} from '@rarible/sdk/build/sdk-blockchains/ethereum/create-collection'
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toCollectionId, toUnionAddress } from "@rarible/types"
import { MintType } from "@rarible/sdk/build/types/nft/mint/domain"




const client = create('http://127.0.0.1:5001/api/v0')




// ====================================================================


export default function Home() {
// ==========================================================================
const [account, setAccount] = useState()
const [sdk, setSdk] = useState()
const [contractAddress, setContractAddress] = useState()
const [metaUrl, setMetaUrl]  = useState()
//  Initialising SDK
function initiateSdk() {
const { ethereum } = window 
if (ethereum && ethereum.isMetaMask){
  setAccount(ethereum['selectedAddress']);
console.log('Ethereum successfully detected!', account)
const web3 = new Web3(ethereum)
const web3Ethereum = new Web3Ethereum({ web3 })
const ethWallet = new EthereumWallet(web3Ethereum)
// const env = "dev" // "e2e" | "ropsten" | "rinkeby" | "mainnet"
const raribleSdk = createRaribleSdk(ethWallet, "staging")
setSdk(raribleSdk);
console.log(raribleSdk.nft)
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
    async function CreateCollection() {

    const ethereumRequest = {
      blockchain:"ETHEREUM",
      asset: {
        assetType: "ERC721",
        arguments: {
          name: "name",
          symbol: "RARI",
          baseURI: "https://ipfs.io/ipfs",
          contractURI: "https://ipfs.io/ipfs",
          isUserToken: false,
        },
      },
    }
      const result = await sdk.nft.createCollection(ethereumRequest)
      console.log(result)
      await result.tx.wait()
      console.log(result.tx.blockchain, result.tx.transaction.hash)
      setContractAddress(result.address)
      return console.log(result.address)
  }


// ==========================================================
// minting nft
async  function mintNft() {
const mintAction = await sdk.nft.mint({
  collectionId:toCollectionId(contractAddress),
})

const mintResult = await mintAction({
  uri:metaUrl,
  royalties: [{
    account: toUnionAddress(contractAddress),
    value: 1000,
}],
creators: [{
    account: toUnionAddress(contractAddress),
    value: 10000,
}],
lazyMint: true,
supply: 1,
})
if (mintResult.type === MintType.OFF_CHAIN) {
return mintResult.itemId
}


}







  // ==================================================
  //file Handling part
  // const [account, setAccount] = useState(null)
  const [file, setFile] = useState(null)
  const [createObjectURL, setCreateObjectURL] = useState('');
  const [imgRes, setImgRes] = useState({});






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
  const url = `https://ipfs.io/ipfs/${added.path}`
  console.log(url);


  const metadata = sdk.nft.preprocessMeta({
    "name": formValue.name,
    "description": formValue.desc,
    "image":url,
    "external_url":`https://app.rarible.com/${account}:123913`,
    "attributes":[],
    })
    console.log(metadata)

 const metaObj = await client.add(metadata)
 console.log(metaObj);
 const metaUrl = `https://ipfs.io/ipfs/${metaObj.path}`
 setMetaUrl(metaUrl)
  console.log(metaUrl)



    }catch (error) {
  console.log('Error uploading', error)
}

}





// const loadMetamask = async () => {
//   // You need to await for user response on the metamask popup dialog
//   const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//   if(accounts){
//     setAccount(accounts[0])
//      console.log(accounts[0]);
//   }
// }


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
         {/* <button
           onClick={()=>loadMetamask()}
         >Connect to Metamask</button> */}
 
     </div>
<div>
<button type='submit' onClick={CreateCollection} >createCollection</button>
<div>
  <button type='submit' onClick={mintNft}>Mint</button>
</div>
</div>
      
    </div>
  )
}
