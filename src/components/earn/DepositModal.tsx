import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { useStableSwapContract } from '../../hooks/useContract'
import { StablePoolInfo, useExpectedLpTokens } from '../../state/stablePools/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useUserTransactionTTL } from '../../state/user/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolInfo: StablePoolInfo
}

export default function DepositModal({ isOpen, onDismiss, poolInfo }: StakingModalProps) {
  const { library, account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const numTokens = poolInfo.tokens.length
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [selectedAmounts, setSelectedAmounts] = useState(new Array(numTokens).fill(JSBI.BigInt('0')))
  const [ttl] = useUserTransactionTTL()

  const expectedLPTokens = useExpectedLpTokens(poolInfo, selectedAmounts)
  const withSlippage = JSBI.subtract(expectedLPTokens.raw, JSBI.divide(expectedLPTokens.raw, JSBI.BigInt('10')))

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStableSwapContract(poolInfo.poolAddress)
  const deadLine = async function onWithdraw() {
    if (stakingContract && poolInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract
        .addLiquidity(selectedAmounts, withSlippage.toString(), ttl)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Deposit Liquidity into ${poolInfo.name}`,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!poolInfo?.stakedAmount) {
    error = error ?? 'Enter an amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Deposit to {poolInfo.name}</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {poolInfo.tokens.map((token, i) => (
            <div key={`deposit-row-${token.symbol}-${i}-${poolInfo.name}`}>
              <CurrencyRow
                tokenAmount={new TokenAmount(token, selectedAmounts[i])}
                setTokenAmount={(val: TokenAmount) =>
                  setSelectedAmounts([
                    ...selectedAmounts.slice(0, i),
                    val.raw,
                    ...selectedAmounts.slice(i + 1, selectedAmounts.length),
                  ])
                }
              />
              {i !== selectedAmounts.length && <TYPE.largeHeader>+</TYPE.largeHeader>}
            </div>
          ))}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you withdraw, your UBE is claimed and your liquidity is removed from the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!poolInfo?.stakedAmount} onClick={() => null}>
            {error ?? 'Withdraw & Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Depositing</TYPE.body>
            <TYPE.body fontSize={20}>Claiming {expectedLPTokens.toSignificant(4)} LP Tokens</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed LP Tokens!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}

type CurrencyRowProps = {
  tokenAmount: TokenAmount
  setTokenAmount: (tokenAmount: TokenAmount) => void
}

const CurrencyRow = ({ tokenAmount, setTokenAmount }: CurrencyRowProps) => {
  const { account } = useActiveWeb3React()
  const token = tokenAmount.currency
  const tokenBalance = useCurrencyBalance(account ?? undefined, token ?? undefined)
  const TEN = JSBI.BigInt('10')

  const scaledDown = (num: JSBI) => JSBI.divide(num, JSBI.exponentiate(TEN, JSBI.BigInt(token.decimals)))
  const scaleUp = (num: JSBI) => JSBI.multiply(num, JSBI.exponentiate(TEN, JSBI.BigInt(token.decimals)))

  return (
    <RowBetween>
      <div>
        <CurrencyLogo currency={token} />
        <div>
          <TYPE.mediumHeader>{token.symbol}</TYPE.mediumHeader>
          <TYPE.subHeader>Balance: {tokenBalance?.toFixed(0)}</TYPE.subHeader>
        </div>
      </div>
      <NumericalInput
        className="token-amount-input"
        value={scaledDown(tokenAmount.raw).toString()}
        onUserInput={(val) => {
          const scaled = scaleUp(JSBI.BigInt(val))
          setTokenAmount(new TokenAmount(token, scaled))
        }}
      />
    </RowBetween>
  )
}
