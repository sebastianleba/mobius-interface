import { Token, TokenAmount } from '@ubeswap/sdk'
import { OpticsDomainInfo } from 'constants/Optics'
import React, { CSSProperties, MutableRefObject, useCallback } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { TYPE } from '../../theme'
import NetworkLogo from '../NetworkLogo'
import { MenuItem } from '../SearchModal/styleds'
import { MouseoverTooltip } from '../Tooltip'

function currencyKey(currency: Token): string {
  return currency instanceof Token ? currency.address : ''
}

const StyledMenuItem = styled(MenuItem)`
  width: 100%;
`

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

function Balance({ balance }: { balance: TokenAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Token }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function NetworkRow({
  network,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  network: OpticsDomainInfo
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { account } = useActiveWeb3React()

  // only show add or remove buttons if not on selected list
  return (
    <StyledMenuItem
      style={{ ...style, display: 'flex' }}
      className={`network-item-${network.name}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <NetworkLogo network={network} size={'24px'} />
      <div />
      <TYPE.mediumHeader style={{ marginLeft: 'auto', justifySelf: 'flex-end' }}>{network.name}</TYPE.mediumHeader>
    </StyledMenuItem>
  )
}

export default function NetworkList({
  height,
  networks,
  selectedNetwork,
  onNetworkSelect,
  otherNetwork,
  fixedListRef,
}: {
  height: number
  networks: OpticsDomainInfo[]
  selectedNetwork?: OpticsDomainInfo | null
  onNetworkSelect: (currency: OpticsDomainInfo) => void
  otherNetwork?: OpticsDomainInfo | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
}) {
  const itemData = networks

  const Row = useCallback(
    ({ data, index, style }) => {
      const network: OpticsDomainInfo = data[index]
      const isSelected = Boolean(selectedNetwork && selectedNetwork.chainId === network.chainId)
      const otherSelected = Boolean(otherNetwork && otherNetwork.chainId === network.chainId)
      const handleSelect = () => onNetworkSelect(network)

      return (
        <NetworkRow
          style={style}
          network={network}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      )
    },
    [onNetworkSelect, otherNetwork, selectedNetwork]
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
