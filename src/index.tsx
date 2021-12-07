import './i18n'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { ContractKitProvider } from '@celo-tools/use-contractkit'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { ChainId } from '@ubeswap/sdk'
import { NETWORK_CHAIN_ID } from 'connectors/index'
import { DevNetworks, MainnetNetworks } from 'constants/NetworkInfo'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { UpdateMento } from 'state/mentoPools/updater'
import UpdatePools from 'state/stablePools/updater'
import StakingUpdater from 'state/staking/updater'

import mobiusIcon from './assets/svg/mobius.svg'
import App from './pages/App'
import store from './state'
import ApplicationUpdater, { PriceData } from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import LogsUpdater from './state/logs/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'

if (window.celo) {
  window.celo.autoRefreshOnNetworkChange = false
}

const networks = NETWORK_CHAIN_ID === ChainId.MAINNET ? MainnetNetworks : DevNetworks

if (process.env.REACT_APP_SENTRY_DSN) {
  const sentryCfg = {
    environment: `${process.env.REACT_APP_VERCEL_ENV ?? 'unknown'}`,
    release: `${process.env.REACT_APP_VERCEL_GIT_COMMIT_REF?.replace(/\//g, '--') ?? 'unknown'}-${
      process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ?? 'unknown'
    }`,
  }
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.2,
    ...sentryCfg,
  })
  console.log(`Initializing Sentry environment at release ${sentryCfg.release} in environment ${sentryCfg.environment}`)
} else {
  console.warn(`REACT_APP_SENTRY_DSN not found. Sentry will not be loaded.`)
}

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap-backup',
  cache: new InMemoryCache(),
})

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <UpdatePools />
      <StakingUpdater />
      <UpdateMento />
      <PriceData />
      <LogsUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <ContractKitProvider
      networks={networks}
      dapp={{
        name: 'Mobius',
        description: 'Multi-chain, stable swap exchange',
        url: 'https://www.mobius.money/#/',
        icon: mobiusIcon,
      }}
      connectModal={{
        reactModalProps: {
          style: {
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              border: 'unset',
              background: 'unset',
              padding: 'unset',
              color: 'black',
            },
            overlay: {
              zIndex: 100,
            },
          },
          overlayClassName: 'tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0',
        },
      }}
    >
      <ApolloProvider client={client}>
        <Provider store={store}>
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <App />
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </ApolloProvider>
    </ContractKitProvider>
  </StrictMode>,
  document.getElementById('root')
)
