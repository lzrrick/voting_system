import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { Modal, Table, Button, useNotification } from "web3uikit"
import networkMapping from "../constants/networkMapping.json"
import votingSystemAbi from "../constants/VotingSystem.json"

export default function CreateVote({
    isVisible,
    onClose,
    candidates = [],
    voteGetting = [],
    number,
}) {
    const { chainId } = useMoralis()
    const { runContractFunction } = useWeb3Contract()

    const chainString = chainId ? parseInt(chainId).toString() : null
    const votingSystemAddress = chainId ? networkMapping[chainString].VotingSystem[0] : null
    const [data, setData] = useState([])
    const dispatch = useNotification()

    function MyButton(candidate_index) {
        return (
            <Button
                color="blue"
                isTransparent
                size="small"
                text="vote"
                onClick={async () => {
                    const options = {
                        abi: votingSystemAbi.fragments,
                        contractAddress: votingSystemAddress,
                        functionName: "executeVote",
                        params: { vote_index: number, candidate_index: candidate_index },
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
                            onClose()
                        },
                        onError: (error) => {
                            dispatch({
                                type: "error",
                                title:
                                    error.data === undefined || error.data.message == undefined
                                        ? error.message
                                        : error.data.message,
                                position: "topR",
                            })
                        },
                    })
                }}
            />
        )
    }
    function updateData() {
        let temp = []
        for (let i = 0; i < candidates.length; i++) {
            temp.push([i + 1, candidates[i], voteGetting[i], MyButton(i)])
        }
        setData(temp)
    }
    useEffect(() => {
        updateData()
    }, [isVisible])

    return (
        <div>
            <Modal
                id="regular"
                isVisible={isVisible}
                onCancel={onClose}
                onCloseButtonPressed={onClose}
                onOk={() => {
                    onClose()
                }}
                width="900px"
            >
                <Table
                    columnsConfig="80px 3fr 2fr 2fr 80px"
                    data={data}
                    header={["", <span>candidates</span>, <span>voted</span>]}
                    maxPages={3}
                    onPageNumberChanged={function noRefCheck() {}}
                    onRowClick={function noRefCheck() {}}
                    pageSize={5}
                />
            </Modal>
        </div>
    )
}
