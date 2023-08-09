import { useWeb3Contract, useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import networkMapping from "../constants/networkMapping.json"
import votingSystemAbi from "../constants/VotingSystem.json"
import VoteCard from "../components/VoteCard"

export default function Home() {
    const { chainId, isWeb3Enabled } = useMoralis()
    const { runContractFunction } = useWeb3Contract()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const votingSystemAddress = chainId ? networkMapping[chainString].VotingSystem[0] : null
    const [voteList, setVoteList] = useState([])

    let number = 0

    // contract functions
    const { runContractFunction: getOwnersVoteIndex } = useWeb3Contract({
        abi: votingSystemAbi.fragments,
        contractAddress: votingSystemAddress,
        functionName: "getOwnersVoteIndex",
        params: {},
    })

    //re render
    async function updateUI() {
        const index_list = await getOwnersVoteIndex()
        number = index_list.length
        let list = []
        for (let i = 0; i < number; i++) {
            const options = {
                abi: votingSystemAbi.fragments,
                contractAddress: votingSystemAddress,
                functionName: "getSingleVoteDescribeJson",
                params: { index: index_list[i] },
            }
            list.push(await runContractFunction({ params: options }))
        }
        setVoteList(list)
    }
    const [reload, setReload] = useState(false)
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            setReload(false)
        }
    }, [isWeb3Enabled, reload])

    return (
        <div>
            <h1 className="py-4 px-4 font-bold text-2xl">My Votes</h1>
            <div className="px-4 flex flex-wrap">
                {isWeb3Enabled && chainId ? (
                    voteList < number ? (
                        <div>Loading...</div>
                    ) : (
                        voteList.map((vote, index) => {
                            const { owner, state, number, title, description } = JSON.parse(vote)
                            return (
                                <VoteCard
                                    owner={owner}
                                    state={state}
                                    number={number}
                                    title={title}
                                    description={description}
                                    isOwnerPage={true}
                                    updateUI={setReload}
                                    key={index}
                                />
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
