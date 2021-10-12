import React, { useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import Modal from '../../components/Modal'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween } from '../../components/Row'
import { CloseIcon, TYPE } from '../../theme'
import ExtendLock from './ExtendLock'
import IncreaseLockAmount from './IncreaseLockAmount'
import Lock from './Lock'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`
export enum LockType {
  initial,
  extend,
  increase,
}

interface LockModalProps {
  isOpen: boolean
  onDismiss: () => void
  lockType?: LockType
}

const ModifiedWrapper = styled(ContentWrapper)`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
  }
`

export default function LockModal({ isOpen, onDismiss, lockType = LockType.initial }: LockModalProps) {
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
        <ModifiedWrapper gap="lg">
          <RowBetween>
            <TYPE.largeHeader>
              {lockType === LockType.initial
                ? 'Lock Mobi'
                : lockType === LockType.extend
                ? 'Extend Lock'
                : 'Increase Amount of Mobi Locked'}
            </TYPE.largeHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {lockType === LockType.initial ? (
            <Lock setAttempting={setAttempting} setHash={setHash} />
          ) : lockType === LockType.extend ? (
            <ExtendLock setAttempting={setAttempting} setHash={setHash} />
          ) : (
            <IncreaseLockAmount setAttempting={setAttempting} setHash={setHash} />
          )}
        </ModifiedWrapper>
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
