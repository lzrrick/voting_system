const { ethers } = require("hardhat")

async function createVote() {
    const user = (await ethers.getSigners())[0]
    const votingSystem = await ethers.getContract("VotingSystem", user)
    const number = parseInt(await votingSystem.getTotalVote())

    await votingSystem.createVote(
        `vote${number + 1}`,
        `description${number + 1}`,
        ["c1", "c2", "c3", "c4", "c5", "c6"]
    )
    // if (number % 2 == 1) {
    //     await votingSystem.closeVote(number)
    // }
}

async function main(count = 1) {
    for (let i = 0; i < count; i++) {
        await createVote()
    }
}

main(5)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

// hh run scripts/create-vote.js --network localhost
