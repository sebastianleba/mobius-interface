import React from 'react'
import styled from 'styled-components'
import { ExternalLink } from 'theme/components'

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
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.red fontSize={[18, 24]}>WARNING</TYPE.red>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <TYPE.body>
          Optics has been entered into recovery mode, and cLabs does not know who currently controls the bridge. The new
          recovery manager has complete control over Optics, including but not limited to burning all funds. It is
          advised to bridge your Optics assets back to their native chain and wait for a resolution from cLabs.
        </TYPE.body>
        <ExternalLink href="https://t.co/v6669QhTo2?amp=1">Read more here</ExternalLink>
      </ContentWrapper>
    </Modal>
  )
}
