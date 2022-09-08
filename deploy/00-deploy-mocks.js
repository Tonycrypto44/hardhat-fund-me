const { LogDescription } = require("ethers/lib/utils")
const { network } = require("hardhat")
const{developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config")
    
    
    module.exports = async({getNamedAccounts, deployment}) => {
        const {deploy, log} = deployments
        const {deployer} = await getNamedAccounts()
       


        if(developmentChains.includes(network.name)) { //includes: function that checks to see if some variable is inside of an array
            log("Local network detetcted! Deploying mocks...")
            await deploy("MockV3Aggregator", {
                contract: "MockV3Aggregator",
                from: deployer,
                log: true,
                args: [DECIMALS, INITIAL_ANSWER],


            })
            log("Mocks Deployed!")
            log("--------------------------------------------")
        }
    }

    module.exports.tags = ["all", "mocks"]
    