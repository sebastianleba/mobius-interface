import { OpticsDomainInfo } from 'constants/Optics'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import Logo from '../Logo'

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function NetworkLogo({
  network,
  size = '24px',
  style,
}: {
  network?: OpticsDomainInfo
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = network?.logoUri

  const srcs: string[] = useMemo(() => {
    return [network?.logoUri]
  }, [network, uriLocations])

  return <StyledLogo size={size} srcs={srcs} alt={`${network?.name ?? 'network'} logo`} style={style} />
}
