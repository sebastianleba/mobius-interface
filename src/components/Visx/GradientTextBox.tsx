import { CardNoise } from 'components/claim/styled'
import { darken } from 'polished'
import React from 'react'
// import {
//   GradientDarkgreenGreen,
//   GradientLightgreenGreen,
//   GradientOrangeRed,
//   GradientPinkBlue,
//   GradientPinkRed,
//   GradientPurpleOrange,
//   GradientPurpleRed,
//   GradientTealBlue,
//   RadialGradient,
//   LinearGradient,
// } from '@visx/gradient'
// import { Bar } from '@visx/shape'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { RowBetween } from '../Row'

const defaultMargin = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const colors = ['#2172e5', '#EC7391', '#BF4B96', '#00BEBF', '#6C4871', '#E2AD57']

const InfoBox = styled.div<{ bgEnd: string }>`
  width: 25%;
  height: 4rem;
  display: flex;
  flex-direction: row;
  margin: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  background: radial-gradient(
      174.47% 188.91% at 1.84% 0%,
      ${({ theme }) => theme.primary1} 0%,
      ${({ bgEnd }) => darken(0.3, bgEnd)} 100%
    ),
    #edeef2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 45%;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 95%;
  `}
`

export type GradientTextProps = {
  id: string
  label: string
  value: string
  i?: number
  margin?: typeof defaultMargin
}

export default function GradientTextBox({ label, value, id, i = 0 }: GradientTextProps) {
  const bgEnd = colors[i % colors.length]
  return (
    <>
      <InfoBox bgEnd={bgEnd}>
        <CardNoise />
        <RowBetween>
          <TYPE.mediumHeader color="white">{label}</TYPE.mediumHeader>
          <TYPE.mediumHeader color="white">{value}</TYPE.mediumHeader>
        </RowBetween>
      </InfoBox>
    </>
  )
}
