import { TransactionResponse } from '@ethersproject/abstract-provider'
import { JSBI, Token } from '@ubeswap/sdk'
import { ChainSelector } from 'components/Bridge/ChainSelector'
import { NetworkInfo, networkInfo } from 'constants/NetworkInfo'
import { OpticsDomainInfo } from 'constants/Optics'
import { ethers } from 'ethers'
import { useBridgeableTokens, useNetworkDomains } from 'hooks/optics'
import { useBridgeRouterContract } from 'hooks/useContract'
import React, { useCallback, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useTokenBalanceSingle } from 'state/wallet/hooks'
import styled from 'styled-components'

import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { Wrapper } from '../../components/swap/styleds'
import { useActiveWeb3React, useWeb3ChainId } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { MobiusTrade, tryParseAmount, useDefaultsFromURLSearch } from '../../state/swap/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { AppBodyNoBackground } from '../AppBody'

const InstructionButton = styled(ButtonPrimary)`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 1.5rem;
`

const WalletButton = styled(ButtonPrimary)`
  margin-top: 2rem;
  margin-bottom: 2rem;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #222 100%);
  overflow: hidden;
  margin-top: 2rem;
`

export default function Optics() {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const isDarkMode = useIsDarkMode()
  const { account } = useActiveWeb3React()
  const chainId = useWeb3ChainId()
  const tokens = useBridgeableTokens()
  const networkConfigs = useNetworkDomains()
  const [val, setVal] = useState<string>()
  const [baseToken, setBaseToken] = useState<Token>()
  const selectedToken = tryParseAmount(val, baseToken)
  const [baseChain, setBaseChain] = useState<OpticsDomainInfo>()
  const [targetChain, setTargetChain] = useState<OpticsDomainInfo>()
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [step, setStep] = useState<number>(0)
  const [attemping, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string>()
  const addTransaction = useTransactionAdder()
  const bridgeContract = useBridgeRouterContract(baseChain?.bridgeRouter)
  async function onSend() {
    if (bridgeContract && step === 5) {
      const paddedAddress = ethers.utils.hexZeroPad(recipientAddress, 32)
      setAttempting(true)
      await bridgeContract
        .send(selectedToken?.token.address, selectedToken?.raw.toString(), targetChain?.domain, paddedAddress, {
          gasLimit: 350000,
        })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Bridged ${baseToken.symbol} to ${targetChain?.name}`,
          })
          setAttempting(false)
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  const baseChainInfo: NetworkInfo = networkInfo[baseChain?.chainId]
  const tokenBalance = useTokenBalanceSingle(account ?? undefined, baseToken)

  const instructions = [
    'Select blockchains',
    'Connect wallet',
    'Select token and amount',
    'Enter address',
    'Approve Token',
    'Send',
  ]

  useEffect(() => {
    if (!baseChain || !targetChain) {
      setStep(0)
      return
    }
    if (baseChain && baseChain.chainId !== chainId) {
      setStep(1)
      return
    }

    switch (step) {
      case 0:
        if (!!baseChain && !!targetChain) {
          setStep(1)
        }
        break
      case 1:
        if (chainId === baseChain?.chainId) {
          setStep(2)
        }
        break
      case 2:
        if (selectedToken && selectedToken.token && selectedToken.greaterThan('0')) {
          setStep(3)
        }
        break
      case 3:
        if (recipientAddress && recipientAddress.match(/0x[a-fA-F0-9]{40}/)) {
          setStep(4)
        }
        break
      case 4:
        if (approval === ApprovalState.APPROVED) {
          setStep(5)
        }
        break
    }
  })

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: MobiusTrade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallback(selectedToken, baseChain?.bridgeRouter)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING ||
    (approvalSubmitted && approval === ApprovalState.APPROVED)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      //onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, swapErrorMessage, tradeToConfirm, txHash])

  const listOfSteps = instructions.map((instruction, i) => (
    <RowFixed key={`instruction-${i}`} marginBottom="0.5rem" opacity={i === step ? 1 : 0.6}>
      <InstructionButton disabled={i > step} onClick={() => i < step && setStep(i)} marginRight="1rem">
        {i + 1}
      </InstructionButton>
      <TYPE.mediumHeader fontWeight={i === step ? 800 : 100}>{instruction}</TYPE.mediumHeader>
    </RowFixed>
  ))

  const actionSteps = [
    <ChainSelector
      baseNetwork={baseChain}
      setBaseNetwork={setBaseChain}
      targetNetwork={targetChain}
      setTargetNetwork={setTargetChain}
      setApprovalSubmitted={setApprovalSubmitted}
      key="chain-selector"
    />,
    baseChain && chainId === baseChain.chainId ? (
      <div style={{ height: '2rem' }} key="separator" />
    ) : (
      <WalletButton
        key="wallet-button"
        onClick={async () => {
          try {
            await window.ethereum?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x' + baseChainInfo.chainId.toString(16) }],
            })
          } catch (switchError) {
            await window.ethereum?.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x' + baseChainInfo.chainId.toString(16),
                  chainName: baseChainInfo.name,
                  nativeCurrency: baseChainInfo.nativeCurrency,
                  rpcUrls: [baseChainInfo.rpcUrl],
                  blockExplorerUrls: [baseChainInfo.explorer],
                },
              ],
            })
          }
        }}
      >
        Connect Wallet
      </WalletButton>
    ),
    <CurrencyInputPanel
      key="bridge-token-input"
      label="Token"
      value={val || '0.00'}
      onUserInput={(value: string) => {
        setVal(value)
      }}
      onMax={() => setVal(tokenBalance?.raw.toString())}
      onCurrencySelect={(currency) => setBaseToken(currency, '0')}
      currency={baseToken}
      id={`Bridge-intput-${baseChain?.chainId}`}
      showMaxButton={!selectedToken?.equalTo(tokenBalance?.raw || '0')}
    />,
    <div key="bridge-recipient" id="recipient" style={{ marginTop: '1rem' }}>
      <AddressInputPanel value={recipientAddress ?? ''} onChange={(val) => setRecipientAddress(val)} />
    </div>,
    <ButtonConfirmed
      key="bridge-confirm"
      onClick={approveCallback}
      disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
      width="100%"
      altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
      confirmed={approval === ApprovalState.APPROVED}
      marginTop="1rem"
    >
      {approval === ApprovalState.PENDING ? (
        <AutoRow gap="6px" justify="center">
          Approving <Loader stroke="white" />
        </AutoRow>
      ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
        'Approved'
      ) : (
        'Approve ' + selectedToken?.token?.symbol
      )}
    </ButtonConfirmed>,
    <ButtonConfirmed
      key="bridge-send"
      onClick={onSend}
      disabled={
        attemping || JSBI.greaterThan(selectedToken?.raw || JSBI.BigInt('1'), tokenBalance?.raw || JSBI.BigInt('0'))
      }
      width="100%"
      altDisabledStyle={attemping} // show solid button while waiting
      confirmed={!!hash}
      marginTop="1rem"
    >
      {JSBI.greaterThan(selectedToken?.raw || JSBI.BigInt('1'), tokenBalance?.raw || JSBI.BigInt('0')) ? (
        'Insufficient Funds'
      ) : attemping ? (
        <AutoRow gap="6px" justify="center">
          Sending <Loader stroke="white" />
        </AutoRow>
      ) : hash ? (
        'Sent! Expect to receive your tokens within 4 hours'
      ) : (
        'Send ' + selectedToken?.token?.symbol
      )}
    </ButtonConfirmed>,
  ]

  return (
    <>
      <SwapPoolTabs active={'optics'} />
      <AppBodyNoBackground>
        <VoteCard>
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Optics Bridge</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white
                  fontSize={14}
                >{`Interface for the recently released Optics Bridge. Currently the Mobius exchange only supports Ethereum assets and not Polygon. Disclaimer: Optics bridge is still in beta.`}</TYPE.white>
              </RowBetween>
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                target="_blank"
                href="https://medium.com/celoorg/optics-is-here-42aa610675ce"
              >
                <TYPE.white fontSize={14}>Read more about the Optics Bridge</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardNoise />
        </VoteCard>
        {isMobile && (
          <RowBetween>
            <TYPE.red
              fontSize={14}
            >{`Bridge interface is currently only available on desktop for Metamask users. Mobile availability coming soon.`}</TYPE.red>
          </RowBetween>
        )}
        <Wrapper style={{ marginTop: isMobile ? '-1rem' : '3rem' }} id="swap-page">
          {actionSteps.slice(0, step + 1).map((action, i) => (
            <div key={`action-${i}`} style={{ opacity: step !== i ? 0.9 : 1 }}>
              {action}
            </div>
          ))}
          <div style={{ height: '2rem' }} />
          {listOfSteps}
        </Wrapper>
      </AppBodyNoBackground>
    </>
  )
}
