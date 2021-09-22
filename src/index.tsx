import './i18n'

import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { NetworkContextName } from './constants'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (window.celo) {
  window.celo.autoRefreshOnNetworkChange = false
}

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

function Updaters() {
  return (
    <>
      {/* <ListsUpdater /> */}
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      {/* <MulticallUpdater /> */}
      {/* <UpdatePools /> */}
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <App />
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)
