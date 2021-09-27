import { TransactionResponse } from '@ethersproject/providers'
import { JSBI } from '@ubeswap/sdk'
import { MaxButton } from 'pages/Pool/styleds'
import React, { useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'
import { GaugeSummary } from 'state/staking/hooks'
import styled from 'styled-components'

import { ButtonError } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import Modal from '../../components/Modal'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween, RowFixed } from '../../components/Row'
import Slider from '../../components/Slider'
import { useActiveContractKit } from '../../hooks'
import { useGaugeControllerContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface GaugeVoteModalProps {
  isOpen: boolean
  onDismiss: () => void
  summary: GaugeSummary
}

export const getAllUnclaimedMobi = (summaries: GaugeSummary[]): JSBI =>
  summaries.reduce((accum, { unclaimedMobi }) => JSBI.add(accum, unclaimedMobi.raw), JSBI.BigInt(0))

export default function GaugeVoteModal({ isOpen, onDismiss, summary }: GaugeVoteModalProps) {
  const { account, chainId } = useActiveContractKit()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [input, setInput] = useState(0)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const controller = useGaugeControllerContract()

  const blockNumber = useBlockNumber()
  async function onClaimReward() {
    if (controller) {
      setAttempting(true)
      await controller
        .vote_for_gauge_weights(summary.address, input * 100, { gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated MOBI rewards`,
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
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Vote for Pool Weights</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <RowFixed>
            <TYPE.body>This can only be done once per pool per week!</TYPE.body>
          </RowFixed>
          <>
            <RowBetween>
              <Slider value={input} onChange={setInput} step={0.01} />
              <TYPE.body>{input.toFixed(0)}%</TYPE.body>
            </RowBetween>
            <RowBetween marginTop={-20}>
              <MaxButton onClick={() => setInput(25)} width="20%">
                25%
              </MaxButton>
              <MaxButton onClick={() => setInput(50)} width="20%">
                50%
              </MaxButton>
              <MaxButton onClick={() => setInput(75)} width="20%">
                75%
              </MaxButton>
              <MaxButton onClick={() => setInput(100)} width="20%">
                Max
              </MaxButton>
            </RowBetween>
          </>
          <RowFixed>
            <TYPE.body>{`Vote for ${summary.pool} to receive ${input.toFixed(0)}% of additional rewards`}</TYPE.body>
          </RowFixed>
          <ButtonError disabled={!!error} error={!!error} onClick={onClaimReward}>
            {error ?? `Vote!`}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Allocating veMOBI</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>veMOBI allocated to {summary.pool}</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
