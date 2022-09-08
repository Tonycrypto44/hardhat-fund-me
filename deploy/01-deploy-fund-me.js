//function deployFunc(hre) {
  //  console.log("Hi!")
//}

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const {verify} = require("../utils/verify")

//module.exports.default = deployFunc

//module.exports = async(hre) => {
    //const {getNamedAccounts,deployments} = hre


//const {networkConfig, developmentChains} = require("../helper-hardhat-config")

    module.exports = async({getNamedAccounts, deployments}) => {
        const {deploy, log, get} = deployments
        const {deployer} = await getNamedAccounts()
        const chainId = network.config.chainId
    
       // const ethUsdPriceFeedAddress= networkConfig[chainId] ["ethUsdPriceFeed"]

        //for a mock contract: if the contract doesn't exsist, we deply a minimal version 
        //for our local testing 
//}
        let ethUsdPriceFeedAddress
        if(developmentChains.includes(network.name)){
            const ethUsdAggregator = await get("MockV3Aggregator")
            ethUsdPriceFeedAddress = ethUsdAggregator.address
        } else{
            ethUsdPriceFeedAddress= networkConfig[chainId] ["ethUsdPriceFeed"]
        }
//what happens when we want to change chains?
// when going for localhost or hardhat network we want to use a mock
const args = [ethUsdPriceFeedAddress]
const fundMe = await deploy ("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
})

if(!developmentChains.includes(network.name && 
    process.env.ETHERSCAN_API_KEY)

){
    await verify(fundMe.address, args)

}
log("-----------------------------------------------------------------------------------------------")
}
 module.exports.tags = ["all", "fundme"]