import { Card, useNotification, Illustration, Badge, Button } from "web3uikit"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { useState } from "react"
import networkMapping from "../constants/networkMapping.json"
import votingSystemAbi from "../constants/VotingSystem.json"
import ShowVote from "../components/ShowVote"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function VoteCard({
    owner,
    state,
    number,
    title,
    description,
    isOwnerPage = false,
    updateUI,
}) {
    const { chainId } = useMoralis()
    const { runContractFunction } = useWeb3Contract()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const votingSystemAddress = chainId ? networkMapping[chainString].VotingSystem[0] : null
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => {
        setShowModal(false)
    }
    const [details, setDetails] = useState(JSON.parse("{}"))
    const dispatch = useNotification()

    const showDetails = async () => {
        const options = {
            abi: votingSystemAbi.fragments,
            contractAddress: votingSystemAddress,
            functionName: "getSingleVoteContentJson",
            params: { index: number },
        }
        setDetails(JSON.parse(await runContractFunction({ params: options })))
        setShowModal(true)
    }
    return (
        <div className="py-1">
            <ShowVote
                isVisible={showModal}
                onClose={hideModal}
                candidates={details.candidates}
                voteGetting={details.vote_getting}
                number={number}
            ></ShowVote>
            <div className="px-1">
                <Card title={title} description={description} onClick={showDetails}>
                    <div>
                        {isOwnerPage ? (
                            ""
                        ) : (
                            <div className="italic text-sm">
                                creater:
                                <div>{truncateStr(owner || "", 15)}</div>
                            </div>
                        )}
                        <Illustration
                            height="180px"
                            logo={state == 1 ? "token" : "lazyNft"}
                            width="100%"
                        />
                        <div className="flex flex-col items-end gap-2">
                            {state == 1 ? (
                                <Badge state="success" text="open" textVariant="caption12" />
                            ) : (
                                <Badge state="danger" text="closed" textVariant="caption12" />
                            )}
                        </div>
                    </div>
                </Card>

                {isOwnerPage ? (
                    <div className="flex justify-center items-center">
                        <Button
                            disabled={state == 0}
                            text="close the vote"
                            isFullWidth
                            onClick={async () => {
                                const options = {
                                    abi: votingSystemAbi.fragments,
                                    contractAddress: votingSystemAddress,
                                    functionName: "closeVote",
                                    params: { index: number },
                                }
                                await runContractFunction({
                                    params: options,
                                    onSuccess: async (tx) => {
                                        await tx.wait(1)
                                        dispatch({
                                            type: "success",
                                            title: "success",
                                            position: "topR",
                                        })
                                        updateUI(true)
                                    },
                                    onError: (error) => {
                                        console.log(error)
                                        dispatch({
                                            type: "error",
                                            title:
                                                error.data === undefined ||
                                                error.data.message == undefined
                                                    ? error.message
                                                    : error.data.message,
                                            position: "topR",
                                        })
                                    },
                                })
                            }}
                        ></Button>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    )
}
