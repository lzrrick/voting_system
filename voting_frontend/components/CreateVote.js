import { useWeb3Contract, useMoralis } from "react-moralis"
import { useState } from "react"
import { Modal, Todo, Input, useNotification } from "web3uikit"
import networkMapping from "../constants/networkMapping.json"
import votingSystemAbi from "../constants/VotingSystem.json"

import Router from "next/router"

export default function CreateVote({ isVisible, onClose }) {
    const { chainId } = useMoralis()
    const { runContractFunction } = useWeb3Contract()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const votingSystemAddress = chainId ? networkMapping[chainString].VotingSystem[0] : null
    const dispatch = useNotification()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    let candidates = []
    return (
        <Modal
            id="regular"
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={async () => {
                if (candidates.size == 0 && title.length == 0 && description.length == 0) {
                    dispatch({
                        type: "error",
                        title: "incomplete information!",
                        position: "topR",
                    })
                } else {
                    const options = {
                        abi: votingSystemAbi.fragments,
                        contractAddress: votingSystemAddress,
                        functionName: "createVote",
                        params: { title: title, description: description, candidates: candidates },
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
                            Router.push("/my-votes")
                        },
                        onError: (error) => {
                            console.log(error)
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
                    setTitle("")
                    setDescription("")
                    candidates = []
                }
            }}
            title="You can create a new vote !"
            width="900px"
        >
            <div className="py-7 px-4">
                <Input
                    label="title"
                    name="title"
                    onBlur={(event) => {
                        setTitle(event.target.value)
                    }}
                    onChange={(event) => {
                        setTitle(event.target.value)
                    }}
                />
            </div>
            <div className="px-4">
                <Input
                    label="description"
                    name="description"
                    onBlur={(event) => {
                        setDescription(event.target.value)
                    }}
                    onChange={(event) => {
                        setDescription(event.target.value)
                    }}
                />
            </div>

            <div className="py-1">
                <Todo
                    label="Enter Candidates"
                    onChange={(updateList) => {
                        candidates = updateList
                    }}
                    todos={[]}
                />
            </div>
        </Modal>
    )
}
