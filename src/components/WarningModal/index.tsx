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
          <TYPE.main fontSize={[18, 24]}>Optics V2 is Live!</TYPE.main>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <TYPE.body>
          Optics V2 bridge interface, Optics V2 pools, and HEAVY Celo rewards are all live for Optics V2 pools!!!
        </TYPE.body>
        <ExternalLink href="https://link.medium.com/95I588uhHlb">Read more here</ExternalLink>
        <RowBetween>
          <TYPE.mediumHeader>{"Don't"} show this again</TYPE.mediumHeader>
          <Toggle isActive={neverShow} toggle={() => setNeverShow(!neverShow)} />
        </RowBetween>
        <ButtonConfirmed onClick={dismiss}>Dismiss</ButtonConfirmed>
      </ContentWrapper>
    </Modal>
  )
}
