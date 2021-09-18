import React, { useState } from 'react'
import styled from 'styled-components'

import { StablePoolInfo } from '../../state/stablePools/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import WithdrawLP from './WithdrawLP'
import WithdrawTokens from './WithdrawTokens'

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
  // monitor call to help UI loading state
  const [byToken, setByToken] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.largeHeader>Withdraw from {poolInfo.name}</TYPE.largeHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <TYPE.subHeader fontWeight={400} fontSize={14}>
                By Token Amount
              </TYPE.subHeader>
              <QuestionHelper text="Withdraw by specific token amounts rather than LP tokens." />
            </RowFixed>
            <Toggle id="toggle-equal-amount-button" isActive={byToken} toggle={() => setByToken(!byToken)} />
          </RowBetween>
          {byToken ? (
            <WithdrawTokens poolInfo={poolInfo} setAttempting={setAttempting} setHash={setHash} />
          ) : (
            <WithdrawLP poolInfo={poolInfo} setAttempting={setAttempting} setHash={setHash} />
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
