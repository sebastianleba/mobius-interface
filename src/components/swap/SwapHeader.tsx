import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { RowBetween } from '../Row'
import Settings from '../Settings'

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader({ title = 'Swap' }: { title?: string }) {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <TYPE.black fontWeight={500}>{title}</TYPE.black>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
