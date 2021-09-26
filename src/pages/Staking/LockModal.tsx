import React, { useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import Modal from '../../components/Modal'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween } from '../../components/Row'
import { StablePoolInfo } from '../../state/stablePools/hooks'
import { CloseIcon, TYPE } from '../../theme'
import Lock from './Lock'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface LockModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolInfo: StablePoolInfo
}

export default function LockModal({ isOpen, onDismiss }: LockModalProps) {
  // monitor call to help UI loading state
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
            <TYPE.largeHeader>Lock Mobi</TYPE.largeHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {/* <RowBetween>
            <RowFixed>
              <TYPE.subHeader fontWeight={400} fontSize={14}>
                By Token Amount
              </TYPE.subHeader>
              <QuestionHelper text="Withdraw by specific token amounts rather than LP tokens." />
            </RowFixed>
            <Toggle id="toggle-equal-amount-button" isActive={byToken} toggle={() => setByToken(!byToken)} />
          </RowBetween> */}
          <Lock setAttempting={setAttempting} setHash={setHash} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Locking Mobi</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Mobi Locked!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
