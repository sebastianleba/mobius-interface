import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { useMobi } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import React, { useState } from 'react'
import { ConstantSumPool } from 'state/openSum/reducer'
import { useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'

import { useActiveContractKit } from '../../hooks'
import { useConstantSumContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolInfo: ConstantSumPool
}

export default function OpenSumWithdrawModal({ isOpen, onDismiss, poolInfo }: StakingModalProps) {
  const { account, chainId } = useActiveContractKit()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useConstantSumContract(poolInfo.address)
  const mobi = useMobi()
  const withdrawFunction = stakingContract?.removeLiquidityOneToken
  const v1Balance = useTokenBalance(poolInfo.address, poolInfo.tokens[0])
  const lpAmount = new TokenAmount(
    poolInfo.lpToken,
    JSBI.multiply(
      v1Balance?.raw ?? JSBI.BigInt('0'),
      JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(poolInfo.lpToken.decimals - (v1Balance?.token.decimals ?? 0)))
    )
  )
  const [approvalStatus, approvalCallback] = useApproveCallback(lpAmount, poolInfo.address)

  async function onWithdraw() {
    if (stakingContract && v1Balance && withdrawFunction) {
      setAttempting(true)
      await withdrawFunction(lpAmount.raw.toString(), v1Balance.token.address, v1Balance.raw.toString(), {
        gasLimit: 3000000,
      })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw ${v1Balance.toFixed(2)} ${v1Balance.token.symbol}`,
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
  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw from {poolInfo.name}</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <TYPE.mediumHeader style={{ textAlign: 'center' }}>
            Withdraw {v1Balance?.toFixed(2)} {v1Balance?.token.symbol}
          </TYPE.mediumHeader>
          {approvalStatus === ApprovalState.APPROVED ? (
            <ButtonError disabled={!!error} error={!!error} onClick={onWithdraw}>
              {error ?? 'Withdraw'}
            </ButtonError>
          ) : (
            <ButtonError disabled={approvalStatus === ApprovalState.PENDING} onClick={approvalCallback}>
              Approve {lpAmount.toFixed(2)} lp token
            </ButtonError>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>
              Withdrawing {v1Balance?.toFixed(2)} {v1Balance?.token.symbol}
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              Withdrew {v1Balance?.toFixed(2)} {v1Balance?.token.symbol}!
            </TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
