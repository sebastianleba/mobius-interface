import { cUSD, Fraction, JSBI, Percent, Price, TokenAmount } from '@ubeswap/sdk'
import QuestionHelper, { LightQuestionHelper } from 'components/QuestionHelper'
import { useActiveContractKit } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import { darken } from 'polished'
import React, { useState } from 'react'
import { useEthBtcPrice } from 'state/application/hooks'
import styled from 'styled-components'
import { getDepositValues } from 'utils/stableSwaps'
import useCUSDPrice from 'utils/useCUSDPrice'

import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_SECONDS_IN_YEAR } from '../../constants'
import { useColor } from '../../hooks/useColor'
import { StablePoolInfo } from '../../state/stablePools/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import CurrencyPoolLogo from '../CurrencyPoolLogo'
import { RowBetween, RowFixed } from '../Row'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  padding-top: 0;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.bg4};
`

const StyledButton = styled(ButtonPrimary)<{ background: any; backgroundHover: any }>`
  background: ${({ background }) => background};
  flex: 0.6;
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

const DepositWithdrawBtn = styled(StyledButton)`
  width: 40%;
  flex: none;
`
interface Props {
  poolInfo: StablePoolInfo
}

export const StablePoolCard: React.FC<Props> = ({ poolInfo }: Props) => {
  const { account, chainId } = useActiveContractKit()
  const {
    tokens,
    peggedTo,
    balances,
    totalDeposited,
    stakedAmount,
    pegComesAfter,
    feesGenerated,
    mobiRate,
    displayDecimals,
    totalStakedAmount: totalStakedLPs,
  } = poolInfo

  const isLive = true
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openManage, setOpenManage] = useState(false)

  const mobi = useMobi()
  const priceOfMobi = useCUSDPrice(mobi) ?? new Price(mobi, cUSD[chainId], '100', '1')
  const userLP = poolInfo.amountDeposited
  const { totalValueStaked, totalValueDeposited, valueOfDeposited } = getDepositValues(poolInfo)
  const coinPrice = useEthBtcPrice(poolInfo.poolAddress)
  const totalStakedAmount = totalValueStaked
    ? new Fraction(
        JSBI.multiply(totalValueStaked.raw, coinPrice),
        JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
      )
    : new Fraction(JSBI.BigInt(0))
  const totalMobiRate = new TokenAmount(mobi, mobiRate ?? JSBI.BigInt('0'))
  let userMobiRate = new TokenAmount(mobi, JSBI.BigInt('0'))
  if (account && mobiRate && totalStakedLPs && totalStakedLPs.greaterThan(JSBI.BigInt(0))) {
    userMobiRate = new TokenAmount(mobi, poolInfo.workingPercentage.multiply(mobiRate ?? '0').toFixed(0))
  }
  let userExternalRates: TokenAmount[] = []
  if (account && poolInfo.externalRewardRates) {
    userExternalRates = poolInfo.externalRewardRates.map(
      (rate) => new TokenAmount(rate.token, poolInfo.totalPercentage.multiply(rate.raw).toFixed(0))
    )
  }
  let rewardPerYear = priceOfMobi.raw.multiply(totalMobiRate.multiply(BIG_INT_SECONDS_IN_YEAR))
  for (let i = 0; i < 8; i++) {
    const rate = poolInfo.externalRewardRates?.[i] ?? totalMobiRate
    // eslint-disable-next-line
    const priceOfToken = useCUSDPrice(rate.token)
    if (poolInfo.externalRewardRates && i < poolInfo.externalRewardRates.length) {
      rewardPerYear = rewardPerYear.add(priceOfToken?.raw.multiply(rate.multiply(BIG_INT_SECONDS_IN_YEAR)) ?? '0')
    }
  }
  const apyFraction =
    mobiRate && totalStakedAmount && !totalStakedAmount.equalTo(JSBI.BigInt(0))
      ? rewardPerYear.multiply(JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))).divide(totalStakedAmount)
      : undefined
  const apy = apyFraction
    ? new Percent(
        apyFraction.numerator,
        JSBI.multiply(apyFraction.denominator, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18')))
      )
    : undefined

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
  let userBalances: TokenAmount[] = []
  if (totalDeposited.greaterThan('0')) {
    userBalances = balances.map((amount) => {
      const fraction = new Fraction(userLP ? userLP.raw : JSBI.BigInt(0), totalDeposited.raw)
      const ratio = fraction.multiply(amount.raw)
      return new TokenAmount(amount.currency, JSBI.divide(ratio.numerator, ratio.denominator))
    })
  }
  const totalVolume = new TokenAmount(poolInfo.lpToken, JSBI.multiply(feesGenerated.raw, JSBI.BigInt('10000')))

  // get the color of the token
  const backgroundColorStart = useColor(tokens[0])
  let backgroundColorEnd = useColor(tokens[tokens.length - 1])
  const backgroundGradient = null //generateGradient(tokens.slice())

  if (!backgroundColorEnd || backgroundColorEnd === backgroundColorStart) backgroundColorEnd = '#212429'

  // get the USD value of staked WETH
  // const apyFraction = poolInfo.apr || undefined
  // const apy = apyFraction ? new Percent(apyFraction.numerator, apyFraction.denominator) : undefined
  const isStaking = valueOfDeposited.greaterThan(JSBI.BigInt('0')) || poolInfo.stakedAmount.greaterThan('0')

  const formatNumber = (num: string) => {
    return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
  return (
    <Wrapper
      showBackground={true}
      background={backgroundGradient}
      bgColor1={backgroundColorStart}
      bgColor2={backgroundColorEnd}
    >
      {openDeposit && <DepositModal isOpen={openDeposit} onDismiss={() => setOpenDeposit(false)} poolInfo={poolInfo} />}
      {openWithdraw && (
        <WithdrawModal isOpen={openWithdraw} onDismiss={() => setOpenWithdraw(false)} poolInfo={poolInfo} />
      )}
      <TopSection>
        <TYPE.black fontWeight={600} fontSize={[18, 24]}>
          {poolInfo.name}
        </TYPE.black>
        {apy ? (
          <RowFixed>
            <QuestionHelper
              text={
                <>
                  Yield/day: {dpy?.toSignificant(4)}%<br />
                  APY (weekly compounded): {weeklyAPY}%
                </>
              }
            />
            <TYPE.subHeader
              style={{ paddingLeft: '.15rem' }}
              color={backgroundColorStart}
              className="apr"
              fontWeight={800}
              fontSize={[14, 18]}
            >
              {apy.denominator.toString() !== '0' ? `${apy.toFixed(0, { groupSeparator: ',' })}%` : ' -'} APR
            </TYPE.subHeader>
          </RowFixed>
        ) : feesGenerated ? (
          <TYPE.subHeader color={backgroundColorStart} className="apr" fontWeight={800} fontSize={[14, 18]}>
            Fees Generated: {pegComesAfter ? '' : peggedTo}
            {feesGenerated.denominator.toString() !== '0'
              ? `${feesGenerated.toFixed(displayDecimals, { groupSeparator: ',' })}`
              : '-'}
            {pegComesAfter ? peggedTo : ''}
          </TYPE.subHeader>
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
              <RowFixed>
                <TYPE.black>
                  {totalValueDeposited
                    ? `${!pegComesAfter ? peggedTo : ''}${formatNumber(totalValueDeposited.toFixed(displayDecimals))} ${
                        pegComesAfter ? peggedTo : ''
                      }`
                    : '-'}
                </TYPE.black>
                <QuestionHelper
                  text={balances
                    .map(
                      (balance) =>
                        `${balance?.toFixed(displayDecimals, { groupSeparator: ',' })} ${balance.token.symbol}`
                    )
                    .join(', ')}
                />
              </RowFixed>
            </RowBetween>
            {mobiRate && (
              <RowBetween>
                <TYPE.black>Pool rate</TYPE.black>
                <AutoColumn style={{ alignItems: 'end' }}>
                  <TYPE.black>
                    {totalMobiRate
                      ? totalMobiRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                      : '0'}
                    {' MOBI / week'}
                  </TYPE.black>
                  {poolInfo.externalRewardRates &&
                    poolInfo.externalRewardRates.map((rate) => (
                      <TYPE.black
                        fontSize={16}
                        fontWeight={500}
                        marginLeft="auto"
                        key={`additional-reward-total-${rate.currency.symbol}-${poolInfo.name}`}
                      >
                        {rate
                          ? rate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                          : '0'}
                        {` ${rate.token.symbol} / week`}
                      </TYPE.black>
                    ))}
                </AutoColumn>
              </RowBetween>
            )}

            <RowBetween>
              <TYPE.black>Total volume</TYPE.black>
              <RowFixed>
                <TYPE.black>
                  {totalVolume
                    ? `${!pegComesAfter ? peggedTo : ''}${totalVolume.toFixed(displayDecimals, {
                        groupSeparator: ',',
                      })} ${pegComesAfter ? peggedTo : ''}`
                    : '-'}
                </TYPE.black>
                <div style={{ width: '26px' }} />
              </RowFixed>
            </RowBetween>

            {false && apy.greaterThan('0') && (
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

          {isLive && isStaking && (
            <>
              <Divider />
              <BottomSection showBackground={true}>
                {mobiRate && (
                  <RowBetween>
                    <TYPE.black fontWeight={500}>Your rate</TYPE.black>
                    <AutoColumn>
                      <TYPE.black fontSize={16} fontWeight={500}>
                        <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                          ⚡
                        </span>
                        {mobiRate
                          ? userMobiRate
                              ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                              ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                          : '0'}
                        {' MOBI / week'}
                      </TYPE.black>
                      {poolInfo.externalRewardRates &&
                        userExternalRates.map((rate) => (
                          <TYPE.black
                            fontSize={16}
                            fontWeight={500}
                            key={`additional-reward-${rate.currency.symbol}-${poolInfo.name}`}
                            marginLeft="auto"
                          >
                            {rate
                              ? rate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toSignificant(4, { groupSeparator: ',' }) ??
                                '-'
                              : '0'}
                            {` ${rate.token.symbol} / week`}
                          </TYPE.black>
                        ))}
                    </AutoColumn>
                  </RowBetween>
                )}
                {isStaking && (
                  <RowBetween>
                    <TYPE.black fontWeight={500}>
                      <span>Your share</span>
                    </TYPE.black>

                    <RowFixed>
                      <TYPE.black style={{ textAlign: 'right' }} fontWeight={500}>
                        {!pegComesAfter && peggedTo}
                        {valueOfDeposited.toFixed(displayDecimals + 1)}
                        {pegComesAfter && ` ${peggedTo}`}
                      </TYPE.black>
                      <QuestionHelper
                        text={userBalances
                          .map(
                            (balance) =>
                              `${balance?.toFixed(displayDecimals + 1, { groupSeparator: ',' })} ${
                                balance.token.symbol
                              }`
                          )
                          .join(', ')}
                      />
                    </RowFixed>
                  </RowBetween>
                )}
              </BottomSection>
            </>
          )}
        </div>
        {/* {!!account && !openManage && !isMobile && (
          <StyledButton
            background={backgroundColorStart}
            backgroundHover={backgroundColorEnd}
            onClick={() => (isStaking ? setOpenManage(true) : setOpenDeposit(true))}
          >
            {isStaking ? 'Manage' : 'Deposit'}
          </StyledButton>
        )} */}
      </InfoContainer>
      {!!account && !openManage && (
        <StyledButton
          background={backgroundColorStart}
          backgroundHover={backgroundColorEnd}
          onClick={() => (isStaking ? setOpenManage(true) : setOpenDeposit(true))}
          style={{ width: '50%', marginLeft: 'auto', marginRight: '1rem' }}
        >
          {isStaking ? 'Manage' : 'Deposit'}
        </StyledButton>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          visibility: openManage ? 'visible' : 'hidden',
          transition: 'all 0.3s ease-in',
          height: !openManage ? '0px' : '100%',
        }}
      >
        <DepositWithdrawBtn
          background={backgroundColorStart}
          backgroundHover={backgroundColorEnd}
          onClick={() => setOpenDeposit(true)}
          style={{ width: '30%' }}
        >
          Deposit
        </DepositWithdrawBtn>
        <DepositWithdrawBtn
          background={backgroundColorStart}
          backgroundHover={backgroundColorEnd}
          onClick={() => setOpenWithdraw(true)}
          style={{ width: '30%' }}
        >
          Withdraw
        </DepositWithdrawBtn>
        {isLive && poolInfo.gaugeAddress !== undefined && (
          <StyledInternalLink to={`/farm/${poolInfo.name}`} style={{ width: '30%' }}>
            <DepositWithdrawBtn
              background={backgroundColorStart}
              backgroundHover={backgroundColorEnd}
              style={{ width: '100%' }}
            >
              Farm
            </DepositWithdrawBtn>
          </StyledInternalLink>
        )}
      </div>
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
