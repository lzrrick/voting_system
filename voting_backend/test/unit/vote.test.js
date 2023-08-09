const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { FixedNumber } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Voting System Unit Tests", function () {
          let deployer, user, votingSystem

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]
              await deployments.fixture(["all"])
              votingSystem = await ethers.getContract("VotingSystem", deployer)
          })

          describe("create a vote", () => {
              beforeEach(async () => {
                  await votingSystem.createVote("vote0", "description", ["1", "2"])
              })

              it("create a vote and check vote number", async () => {
                  const tx_response = await votingSystem.createVote("title", "description", [
                      "1",
                      "2",
                  ])
                  const tx_receipt = await tx_response.wait(1)
                  const vote_number = tx_receipt.logs[0].args.vote_number
                  const total_vote = await votingSystem.getTotalVote()
                  assert(
                      FixedNumber.fromValue(vote_number)
                          .add(FixedNumber.fromValue(1))
                          .eq(FixedNumber.fromValue(total_vote))
                  )
              })

              it("create a vote and candidatas are not the same", async () => {
                  await expect(
                      votingSystem.createVote("title", "description", ["same", "same"])
                  ).to.be.revertedWithCustomError(votingSystem, "HaveSameCandidates")
              })

              it("close a vote and check the state", async () => {
                  let vote = await votingSystem.getSingleVote(0)
                  assert(vote.state.toString() == "1")

                  await votingSystem.closeVote(0)
                  vote = await votingSystem.getSingleVote(0)
                  assert(vote.state.toString() == "0")
              })

              it("execute a vote", async () => {
                  votingSystem = votingSystem.connect(user)
                  await expect(votingSystem.executeVote(9999, 0)).to.be.revertedWithCustomError(
                      votingSystem,
                      "VoteNotExist"
                  )
                  await expect(votingSystem.executeVote(0, 9999)).to.be.revertedWithCustomError(
                      votingSystem,
                      "CandidateNotExist"
                  )

                  await votingSystem.executeVote(0, 0)
                  await expect(votingSystem.executeVote(0, 1)).to.be.revertedWithCustomError(
                      votingSystem,
                      "ALreadyVote"
                  )

                  votingSystem = votingSystem.connect(deployer)
                  let vote = await votingSystem.getSingleVote(0)
                  assert(vote.vote_getting[0].toString() == "1")
              })
          })

          describe("close a vote", () => {
              beforeEach(async () => {
                  await votingSystem.createVote("vote0", "description", ["1", "2"])
              })

              it("only owner can close a vote", async () => {
                  await expect(votingSystem.closeVote(9999)).to.be.revertedWithCustomError(
                      votingSystem,
                      "VoteNotExist"
                  )
                  votingSystem = votingSystem.connect(user)
                  await expect(votingSystem.closeVote(0)).to.be.revertedWithCustomError(
                      votingSystem,
                      "NotOwner"
                  )

                  votingSystem = votingSystem.connect(deployer)
                  votingSystem.closeVote(0)
                  await expect(votingSystem.executeVote(0, 0)).to.be.revertedWithCustomError(
                      votingSystem,
                      "VotClosed"
                  )
              })
          })

          describe("getter function", () => {
              beforeEach(async () => {
                  await votingSystem.createVote("vote0", "description", ["1", "2"])
              })

              it("get a vote", async () => {
                  await expect(votingSystem.getSingleVote(9999)).to.be.revertedWithCustomError(
                      votingSystem,
                      "VoteNotExist"
                  )
                  votingSystem = votingSystem.connect(user)
                  await votingSystem.createVote("vote1", "description", ["1", "2"])
                  await votingSystem.createVote("vote2", "description", ["1", "2"])
                  const vote_list = await votingSystem.getVoteList()
                  const user_vote = await votingSystem.getOwnersVote()
                  assert(vote_list.length == 3)
                  assert(user_vote.length == 2)
              })
          })
      })
