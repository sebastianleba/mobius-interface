import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useStableSwapContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StablePoolInfo, useExpectedTokens } from '../../state/stablePools/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError, ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface WithdrawModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolInfo: StablePoolInfo
}

export default function WithdrawModal({ isOpen, onDismiss, poolInfo }: WithdrawModalProps) {
  const { library, account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const { tokens, lpToken } = poolInfo
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<TokenAmount>(new TokenAmount(lpToken, JSBI.BigInt('0')))

  const deadline = useTransactionDeadline()

  const expectedTokens = useExpectedTokens(poolInfo, selectedAmount)
  const [approvalStatus, approvalCallback] = useApproveCallback(selectedAmount, poolInfo.poolAddress)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStableSwapContract(poolInfo.poolAddress)
  async function onWithdraw() {
    if (stakingContract && poolInfo?.stakedAmount) {
      setAttempting(true)
      const expected = expectedTokens.map((amount) => BigInt(amount.raw.toString()))
      await stakingContract
        .removeLiquidity(selectedAmount.raw.toString(), expected, deadline)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw Liquidity from ${poolInfo.name}`,
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
            <TYPE.largeHeader>Withdraw from {poolInfo.name}</TYPE.largeHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <CurrencyRow tokenAmount={selectedAmount} setTokenAmount={(val: TokenAmount) => setSelectedAmount(val)} />
          {selectedAmount.greaterThan(JSBI.BigInt('0')) && (
            <div>
              <TYPE.mediumHeader style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                You will received
              </TYPE.mediumHeader>
              {expectedTokens.map((tokenAmount, i) => (
                <>
                  <CurrencyRow
                    key={'expected-' + tokenAmount.token.address}
                    tokenAmount={tokenAmount}
                    setTokenAmount={(val: TokenAmount) => null}
                    readOnly={true}
                  />
                  {i !== expectedTokens.length - 1 && (
                    <TYPE.largeHeader style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
                      +
                    </TYPE.largeHeader>
                  )}
                </>
              ))}
            </div>
          )}
          {approvalStatus !== ApprovalState.APPROVED && selectedAmount.greaterThan(JSBI.BigInt('0')) && (
            <ButtonPrimary
              disabled={approving}
              onClick={async () => {
                setApproving(true)
                await approvalCallback()
                await new Promise((resolve) => setTimeout(resolve, 20000))
                setApproving(false)
              }}
            >
              Approve LP Token
            </ButtonPrimary>
          )}
          {approvalStatus === ApprovalState.APPROVED && (
            <ButtonError disabled={!!error} error={!!error && !!poolInfo?.stakedAmount} onClick={onWithdraw}>
              {error ?? 'Withdraw'}
            </ButtonError>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing</TYPE.body>
            <TYPE.body fontSize={20}>Claiming Tokens!</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed Tokens!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}

type CurrencyRowProps = {
  tokenAmount: TokenAmount
  setTokenAmount: (tokenAmount: TokenAmount) => void
  readOnly: boolean | undefined
}

const InputRowLeft = styled.div``

const TokenInfo = styled.div``

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const InputDiv = styled.div`
  display: flex;
  min-width: 40%;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.bg2};
  z-index: 1;
  width: 100%;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
  padding: 0.5rem;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme }) => theme.text1};
`
const BalanceText = styled(TYPE.subHeader)`
  cursor: pointer;
`

const CurrencyRow = ({ tokenAmount, setTokenAmount, readOnly }: CurrencyRowProps) => {
  const { account } = useActiveWeb3React()
  const currency = tokenAmount.currency
  const tokenBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const TEN = JSBI.BigInt('10')
  const ZERO_TOK = new TokenAmount(currency, JSBI.BigInt('0'))

  const scaledDown = (num: JSBI) => JSBI.divide(num, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals)))
  const scaleUp = (num: JSBI) => JSBI.multiply(num, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals)))

  const mainRow = (
    <InputRow>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Aligner>
          <CurrencyLogo currency={currency} size={'34px'} />
          <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
            {(currency && currency.symbol && currency.symbol.length > 20
              ? currency.symbol.slice(0, 4) +
                '...' +
                currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
              : currency?.symbol) || ''}
          </StyledTokenName>
        </Aligner>
      </div>
      <InputDiv>
        <NumericalInput
          className="token-amount-input"
          disabled={readOnly}
          value={scaledDown(tokenAmount.raw)}
          onUserInput={(val) => {
            const amount = tryParseAmount(val, currency)
            setTokenAmount(amount || ZERO_TOK)
          }}
        />
      </InputDiv>
    </InputRow>
  )
  const balanceRow = !readOnly && (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <BalanceText onClick={() => setTokenAmount(tokenBalance || ZERO_TOK)}>
        Balance: {tokenBalance?.toFixed(2)}
      </BalanceText>
    </div>
  )

  return (
    <div>
      {balanceRow}
      {mainRow}
    </div>
  )
}

const insertDecimal = (tokenAmount: TokenAmount) => {
  const { token } = tokenAmount
  const amount = tokenAmount.divide(
    new TokenAmount(token, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(token.decimals)))
  )
  return amount.toFixed(2)
}
