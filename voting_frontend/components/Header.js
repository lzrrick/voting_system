import Link from "next/link"
import { ConnectButton, Button, Hero } from "web3uikit"
import { useState } from "react"
import CreateVote from "./CreateVote.js"

export default function Header() {
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => {
        setShowModal(false)
    }

    return (
        <div>
            <CreateVote isVisible={showModal} onClose={hideModal}></CreateVote>
            <Hero
                backgroundURL="https://moralis.io/wp-content/uploads/2021/06/blue-blob-background-2.svg"
                padding="40px"
                height="400px"
            >
                <div className="text-center py-16  font-bold text-5xl">Voting System</div>
                <nav className="p-2 border-b-2 flex flex-row justify-between items-center">
                    <div className="flex flex-row items-center font-bold text-2xl">
                        <Link href="/">
                            <a className="mr-4 p-6">Home</a>
                        </Link>
                        <Link href="/my-votes">
                            <a className="mr-4 p-6">My votes</a>
                        </Link>
                        <Button
                            color="green"
                            size="large"
                            onClick={() => {
                                setShowModal(true)
                            }}
                            text="Add a vote"
                            theme="secondary"
                        />
                        <ConnectButton moralisAuth={false} />
                    </div>
                </nav>
            </Hero>
        </div>
    )
}
