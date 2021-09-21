import { networkInfo } from 'constants/NetworkInfo'
import { MultiChainIds } from 'constants/Optics'
import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'

import { getExplorerLink } from '../../constants/NetworkInfo'
import { useActiveContractKit, useChainId } from '../../hooks'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveContractKit()

  const theme = useContext(ThemeContext)
  const otherChainId = useChainId()
  const { explorer } = networkInfo[chainId as MultiChainIds]
  const explorerLink = getExplorerLink(chainId, hash, 'transaction')

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
        {chainId && <ExternalLink href={explorerLink}>View on Explorer</ExternalLink>}
      </AutoColumn>
    </RowNoFlex>
  )
}
