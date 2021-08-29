import { JSBI, Percent } from '@ubeswap/sdk'
import QuestionHelper, { LightQuestionHelper } from 'components/QuestionHelper'
import { useStakingPoolValue } from 'pages/Earn/useStakingPoolValue'
import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'

import { useColor } from '../../hooks/useColor'
import { StablePoolInfo } from '../../state/stablePools/hooks'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import CurrencyPoolLogo from '../CurrencyPoolLogo'
import { RowBetween, RowFixed } from '../Row'
//import { CardNoise } from './styled'

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  padding-top: 0;
`

const VerticalDivider = styled.div`
  width: 1px;
  height: 100%;
  margin-right: 0.5rem;
  background: ${({ theme }) => theme.bg4};
`

const StyledButton = styled(ButtonPrimary)<{ background: any; backgroundHover: any }>`
  background: ${({ background }) => background};
  flex: 1;
  &:hover {
    background: ${({ background }) => darken(0.1, background)};
  }
`

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  
`};
`

const InfoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  padding: 8px;
`
// background: ${({ bgColor1, bgColor2 }) =>
// `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor1} 0%, ${bgColor2} 100%) `};

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; background: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
`}
`

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  z-index: 1;
`

interface Props {
  poolInfo: StablePoolInfo
}

export const StablePoolCard: React.FC<Props> = ({ poolInfo }: Props) => {
  const { tokens, peggedTo, virtualPrice, priceOfStaked } = poolInfo

  // get the color of the token
  const backgroundColorStart = useColor(tokens[0])
  let backgroundColorEnd = useColor(tokens[tokens.length - 1])
  const backgroundGradient = null //generateGradient(tokens.slice())

  if (!backgroundColorEnd || backgroundColorEnd === backgroundColorStart) backgroundColorEnd = '#212429'

  // get the USD value of staked WETH
  const {
    valueCUSD: valueOfTotalStakedAmountInCUSD,
    userValueCUSD,
    userAmountTokenA,
    userAmountTokenB,
  } = useStakingPoolValue(poolInfo)
  const apyFraction = poolInfo.apr || undefined
  const apy = apyFraction ? new Percent(apyFraction.numerator, apyFraction.denominator) : undefined
  const isStaking = priceOfStaked.greaterThan(JSBI.BigInt('0'))

  console.log({ isStaking, priceOfStaked })

  const dpy = apy
    ? new Percent(Math.floor(parseFloat(apy.divide('365').toFixed(10)) * 1_000_000).toFixed(0), '1000000')
    : undefined

  let weeklyAPY: React.ReactNode | undefined = <>🤯</>
  try {
    weeklyAPY = apy
      ? new Percent(
          Math.floor(parseFloat(apy.divide('52').add('1').toFixed(10)) ** 52 * 1_000_000).toFixed(0),
          '1000000'
        ).toFixed(0, { groupSeparator: ',' })
      : undefined
  } catch (e) {
    console.error('Weekly apy overflow', e)
  }

  return (
    <Wrapper
      showBackground={true}
      background={backgroundGradient}
      bgColor1={backgroundColorStart}
      bgColor2={backgroundColorEnd}
    >
      <TopSection>
        <TYPE.black fontWeight={600} fontSize={[18, 24]}>
          {poolInfo.name}
        </TYPE.black>
        {apy && apy.greaterThan('0') ? (
          <TYPE.small className="apr" fontWeight={400} fontSize={14}>
            {apy.denominator.toString() !== '0' ? `${apy.toFixed(0, { groupSeparator: ',' })}%` : '-'} APR
          </TYPE.small>
        ) : (
          <TYPE.black fontWeight={600} fontSize={[14, 18]}>
            Coming Soon!
          </TYPE.black>
        )}
      </TopSection>
      <SubHeader>
        <RowBetween>
          <CurrencyPoolLogo tokens={tokens.slice()} size={24} />
          <PoolInfo style={{ marginLeft: '8px' }}>
            <TYPE.black fontWeight={600} fontSize={[14, 24]}>
              {tokens.map((t) => t.symbol).join(' / ')}
            </TYPE.black>
          </PoolInfo>
        </RowBetween>
      </SubHeader>
      <InfoContainer>
        <div style={{ flex: 3 }}>
          <StatContainer>
            <RowBetween>
              <TYPE.black>Total deposited</TYPE.black>
              <TYPE.black>
                {virtualPrice
                  ? `${peggedTo}${virtualPrice.toFixed(0, {
                      groupSeparator: ',',
                    })}`
                  : '-'}
              </TYPE.black>
            </RowBetween>
            {apy && apy.greaterThan('0') && (
              <RowBetween>
                <RowFixed>
                  <TYPE.black>APR</TYPE.black>
                  <LightQuestionHelper
                    text={
                      <>
                        Yield/day: {dpy?.toSignificant(4)}%<br />
                        APY (weekly compounded): {weeklyAPY}%
                      </>
                    }
                  />
                </RowFixed>
                <TYPE.black>
                  {apy.denominator.toString() !== '0' ? `${apy.toFixed(0, { groupSeparator: ',' })}%` : '-'}
                </TYPE.black>
              </RowBetween>
            )}
          </StatContainer>

          {isStaking && (
            <>
              <BottomSection showBackground={true}>
                {isStaking && (
                  <RowBetween>
                    <TYPE.black fontWeight={500}>
                      <span>Your share</span>
                    </TYPE.black>

                    <RowFixed>
                      <TYPE.black style={{ textAlign: 'right' }} fontWeight={500}>
                        {peggedTo}
                        {priceOfStaked.toFixed(0, { groupSeparator: ',' })}
                      </TYPE.black>
                      <QuestionHelper
                        text={`${userAmountTokenA?.toFixed(0, { groupSeparator: ',' })} ${
                          userAmountTokenA?.token.symbol
                        }, ${userAmountTokenB?.toFixed(0, { groupSeparator: ',' })} ${userAmountTokenB?.token.symbol}`}
                      />
                    </RowFixed>
                  </RowBetween>
                )}
              </BottomSection>
            </>
          )}
        </div>
        <StyledButton background={backgroundColorStart} backgroundHover={backgroundColorEnd}>
          {isStaking ? 'Manage' : 'Deposit'}
        </StyledButton>
      </InfoContainer>
    </Wrapper>
  )
}

const PoolInfo = styled.div`
  .apr {
    margin-top: 4px;
    display: none;
    ${({ theme }) => theme.mediaWidth.upToSmall`
  display: block;
  `}
  }
`
