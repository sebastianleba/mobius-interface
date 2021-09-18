import Column from 'components/Column'
import { RowBetween } from 'components/Row'
import { OpticsDomainInfo } from 'constants/Optics'
import { useNetworkDomains } from 'hooks/optics'
import React, { useCallback, useRef } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'
import { CloseIcon } from 'theme'

import useLast from '../../hooks/useLast'
import Modal from '../Modal'
import { PaddedColumn, Separator } from '../SearchModal/styleds'
import NetworkList from './NetworkList'

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
`

interface NetworkSearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedNetwork?: OpticsDomainInfo | null
  onNetworkSelect: (currency: OpticsDomainInfo) => void
  otherSelectedNetwork?: OpticsDomainInfo | null
}

export enum CurrencyModalView {
  search,
  manage,
  importToken,
  importList,
}

export default function NetworkSelectModal({
  isOpen,
  onDismiss,
  onNetworkSelect,
  selectedNetwork,
  otherSelectedNetwork,
}: NetworkSearchModalProps) {
  const lastOpen = useLast(isOpen)
  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()
  const networkList = useNetworkDomains()

  const handleCurrencySelect = useCallback(
    (network: OpticsDomainInfo) => {
      onNetworkSelect(network)
      onDismiss()
    },
    [onDismiss, onNetworkSelect]
  )

  // change min height if not searching
  const minHeight = 80

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
      <ContentWrapper>
        <PaddedColumn gap="16px">
          <RowBetween>
            <Text fontWeight={500} fontSize={16}>
              Select a Chain
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </PaddedColumn>
        <Separator />
        <div style={{ flex: '1' }}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <NetworkList
                height={height}
                networks={networkList}
                onNetworkSelect={(d) => {
                  onNetworkSelect(d)
                  onDismiss()
                }}
                otherNetwork={otherSelectedNetwork}
                selectedNetwork={selectedNetwork}
                fixedListRef={fixedList}
              />
            )}
          </AutoSizer>
        </div>
      </ContentWrapper>
    </Modal>
  )
}
