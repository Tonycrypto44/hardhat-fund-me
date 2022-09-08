const { inputToConfig } = require("@ethereum-waffle/compiler")
const { network, deployments, ethers } = require("hardhat") //pulling deployements and ethers keywords from hardhat
const { assert, expect } = require("chai") 
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
 ? describe.skip

:describe("FundMe", async function ( ) {
   
    let FundMe
    let deployer
    let MockV3Aggregator
    
    const sendValue = ethers.utils.parseEther("1") // 1 ETH
    beforeEach( async function () {
        //deploy our fundMe contract
        //using Hardhat-deploy
        
       deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // fixture lets us use as many tags as we want in our deployments, all allows us to deploy fund me and our mock
        //getContract gets the most recent deployment of any contract we tell it
        FundMe = await ethers.getContract( "FundMe", deployer)  // after deployment we can get the contracts
        MockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer)
    })

        describe("constructor", async function () {
            it("sets the aggregator addresses correctly", async function (){
                const response = await FundMe.getPriceFeed()
               assert.equal(response,MockV3Aggregator.address)
            })
        })
        describe("Fund", async function (){
            it("Fails if you don't send enough ETH", async function (){
                await expect(FundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })
            it("updated the amount funded data structure", async function() {
                await FundMe.fund({value: sendValue})
                const response = await FundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("Adds funder to array of getFunder", async function(){
                await FundMe.fund({value:sendValue})
                const funder = await FundMe.getFunder(0)
                assert.equal(funder,deployer)
            })
        })
        describe("withdraw", async function () {
            beforeEach(async function() {
                await FundMe.fund({ value: sendValue})
            })
            it("Withdraw ETH from a single funder", async () => {
                // Arrange
                const startingFundMeBalance =
                    await FundMe.provider.getBalance(FundMe.address)
                const startingDeployerBalance =
                    await FundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await FundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const endingDeployerBalance =
                    await FundMe.provider.getBalance(deployer)

                // Assert
                // Maybe clean up to understand the testing
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("Withdraw ETH from a single funder", async () => {
                // Arrange
                const startingFundMeBalance =
                    await FundMe.provider.getBalance(FundMe.address)
                const startingDeployerBalance =
                    await FundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await FundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const endingDeployerBalance =
                    await FundMe.provider.getBalance(deployer)

                // Assert
                // Maybe clean up to understand the testing
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("allows us to withdraw with multiple getFunder", async function (){
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i =1; i <6; i++) { // i=0 is the deployer
                    const FundMeConnectedContract = await FundMe.connect(
                        accounts[i]
                    )
                    await FundMeConnectedContract.fund({value: sendValue})
                }
                const startingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const startingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )
                //Act 
                const transactionResponse = await FundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)
                const endingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const endingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )
                //Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
                //Make sure that the getFunder are reset properly
                await expect(FundMe.getFunder(0)).to.be.reverted

                for(i=1; i<6;i++) {
                    assert.equal(
                        await FundMe.getAddressToAmountFunded(accounts[i].address),
                        0
                    )
                }
            })
            it("Only allows the owner to withdraw", async function () {
                const accounts= await ethers.getSigners() // uses get signer to grab accounts from ethers
                const attacker = accounts[1] // account 1 is an attacker
                const attackerConnectedContract = await FundMe.connect(attacker) //connecting the hacker to a contract
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner"
                ) // attacker should not be able to withdraw
            })
            it("cheaperWithdraw testing...", async function (){
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i =1; i <6; i++) { // i=0 is the deployer
                    const FundMeConnectedContract = await FundMe.connect(
                        accounts[i]
                    )
                    await FundMeConnectedContract.fund({value: sendValue})
                }
                const startingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const startingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )
                //Act 
                const transactionResponse = await FundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)
                const endingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const endingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )
                //Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
                //Make sure that the getFunder are reset properly
                await expect(FundMe.getFunder(0)).to.be.reverted

                for(i=1; i<6;i++) {
                    assert.equal(
                        await FundMe.getAddressToAmountFunded(accounts[i].address),
                        0
                    )
                }
            })

        })
})

