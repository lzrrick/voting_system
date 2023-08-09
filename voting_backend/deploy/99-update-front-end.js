const { ethers, network } = require("hardhat")
const fs = require("fs")

const frontEndContractsFile = "../voting_frontend/constants/networkMapping.json"
const frontendAbiLocation = "../voting_frontend/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        await updateContractAddress("VotingSystem")
        await updateAbi("VotingSystem")
        console.log("----------------------------------------------------")
    }
}

async function updateContractAddress(contractName) {
    const contract = await ethers.getContract(contractName)
    const contractAddress = await contract.getAddress()

    const chainId = network.config.chainId.toString()
    const networkMapping = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in networkMapping) {
        if (!networkMapping[chainId][contractName]) {
            networkMapping[chainId][contractName] = [contractAddress]
        } else if (!networkMapping[chainId][contractName].includes(contractAddress)) {
            networkMapping[chainId][contractName].push(contractAddress)
        }
    } else {
        networkMapping[chainId] = { VotingSystem: [contractAddress] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(networkMapping))
}

async function updateAbi(contractName) {
    const contract = await ethers.getContract(contractName)
    fs.writeFileSync(
        `${frontendAbiLocation}${contractName}.json`,
        JSON.stringify(contract.interface)
    )
}

module.exports.tags = ["all", "frontend"]
