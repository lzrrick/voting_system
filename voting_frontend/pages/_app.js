import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>Vote</title>
                <meta name="description" content="Voting System" />
                <link rel="icon" href="../public/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Header />
                    <Component {...pageProps} />
                </NotificationProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
