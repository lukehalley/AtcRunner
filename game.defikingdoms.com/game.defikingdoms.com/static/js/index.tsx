import { StrictMode } from 'react'
import { isMobile } from 'react-device-detect'
import { createRoot } from 'react-dom/client'
import ReactGA from 'react-ga'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/core/styles'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import Blocklist from 'components/Blocklist'
import { ChainPicker } from 'components/ChainPicker'
import { outposts, realms } from 'constants/chains'
import { NetworkContextName } from 'constants/index'
import store from 'features'
import ApplicationUpdater from 'features/application/updater'
import { BridgeContextProvider } from 'features/bridge/context/provider'
import { initI18n } from 'features/i18n/init'
import ListsUpdater from 'features/lists/updater'
import MulticallUpdater from 'features/multicall/updater'
import TransactionUpdater from 'features/transactions/updater'
import UserUpdater from 'features/user/updater'
import { useActiveWeb3React } from 'hooks'
import 'index.css'
import 'inter-ui'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'
import DKTheme from 'theme/MaterialUiTheme'
import getLibrary from 'utils/getLibrary'

initI18n('/i18n/{{lng}}/translation.json')

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

const GOOGLE_ANALYTICS_ID: string | undefined = 'UA-209041480-1'
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID)
  ReactGA.set({
    customBrowserType: !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  })
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

window.addEventListener('error', error => {
  ReactGA.exception({
    description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
    fatal: true
  })
})

function AnyChainUpdaters() {
  const { chainId } = useActiveWeb3React()
  if (chainId) {
    return <ApplicationUpdater />
  } else {
    return null
  }
}

function Updaters() {
  const { chainId } = useActiveWeb3React()
  if (chainId && (realms.includes(chainId) || outposts.includes(chainId))) {
    return (
      <>
        <ListsUpdater />
        <UserUpdater />
        <TransactionUpdater />
        <MulticallUpdater />
      </>
    )
  } else {
    return null
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Blocklist>
          <Provider store={store}>
            <Updaters />
            <AnyChainUpdaters />
            <ThemeProvider>
              <ThemedGlobalStyle />
              <MaterialThemeProvider theme={DKTheme}>
                <HashRouter>
                  <BridgeContextProvider>
                    <ChainPicker />
                  </BridgeContextProvider>
                </HashRouter>
              </MaterialThemeProvider>
            </ThemeProvider>
          </Provider>
        </Blocklist>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>
)

serviceWorkerRegistration.unregister()
