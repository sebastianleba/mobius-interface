import { ButtonConfirmed } from 'components/Button'
import Toggle from 'components/Toggle'
import React, { useState } from 'react'
import styled from 'styled-components'
import { ExternalLink } from 'theme/components'
import { getCookie, setCookie } from 'utils/cookies'

import { CloseIcon, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function WarningModal({ isOpen, onDismiss }: ModalProps) {
  const [neverShow, setNeverShow] = useState(false)
  const COOKIE_NAME = 'optics-warning'
  const dismiss = () => {
    if (neverShow) {
      setCookie(COOKIE_NAME, 'true', 31)
    }
    onDismiss()
  }
  const cookieExists = !!getCookie(COOKIE_NAME)
  return (
    <Modal isOpen={!cookieExists && isOpen} onDismiss={dismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.red fontSize={[18, 24]}>Optics Update</TYPE.red>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <TYPE.body>
          Optics has been taken out of recovery mode, and the recovery manager has been transfered to a community-owned
          multisig (Mobius is actually on this multisig). We still await action from cLabs whether or not Optics will be
          redeployed.
        </TYPE.body>
        <ExternalLink href="https://forum.celo.org/t/optics-recovery-mode/2452">Read more here</ExternalLink>
        <RowBetween>
          <TYPE.mediumHeader>{"Don't"} show this again</TYPE.mediumHeader>
          <Toggle isActive={neverShow} toggle={() => setNeverShow(!neverShow)} />
        </RowBetween>
        <ButtonConfirmed onClick={dismiss}>Dismiss</ButtonConfirmed>
      </ContentWrapper>
    </Modal>
  )
}
