
const networkConfig = {
    default: {
        name: "hardhat",
    },
    31337: {
        name: "hardhat",
    },
    11155111: {
        name: "sepolia",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
// const frontEndContractsFile = "../nextjs-smartcontract-lottery-fcc/constants/contractAddresses.json"
// const frontEndAbiFile = "../nextjs-smartcontract-lottery-fcc/constants/abi.json"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}
