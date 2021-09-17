import { Fraction, JSBI, Price, TokenAmount } from '@ubeswap/sdk'
import CurrencyPoolLogo from 'components/CurrencyPoolLogo'
import QuestionHelper from 'components/QuestionHelper'
import { useMobi } from 'hooks/Tokens'
import React, { useCallback, useState } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useStablePoolInfoByName } from 'state/stablePools/hooks'
import styled from 'styled-components'
import { CountUp } from 'use-count-up'
import useCUSDPrice from 'utils/useCUSDPrice'

import { ButtonEmpty, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import StakingModal from '../../components/earn/StakingModal'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import UnstakingModal from '../../components/earn/UnstakingModal'
import { RowBetween, RowFixed } from '../../components/Row'
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLinkIcon, TYPE } from '../../theme'
import { useStakingPoolValue } from './useStakingPoolValue'

const PageWrapper = styled(AutoColumn)`
  margin-top: 3rem;
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

const quote = (price: Price, amount: TokenAmount) => {
  const fraction = new Fraction(price.denominator, price.numerator)
  return new TokenAmount(price.quoteCurrency, fraction.multiply(amount.raw).quotient)
}

const useQuote = (price: Price) => (amount: TokenAmount) => quote(price, amount)

export default function Manage({
  match: {
    params: { poolName },
  },
}: RouteComponentProps<{ poolName: string }>) {
  const { account, chainId } = useActiveWeb3React()
  const mobi = useMobi()

  // get currencies and pair
  const stakingInfo = useStablePoolInfoByName(poolName)

  const { totalStaked, userStaked } = useStakingPoolValue(stakingInfo)

  const { balances, stakedAmount, totalStakedAmount, tokens } = stakingInfo

  const earnedMobi = new TokenAmount(mobi, stakingInfo.pendingMobi ?? JSBI.BigInt('0'))
  let userMobiRate = new TokenAmount(mobi, JSBI.BigInt('0'))
  if (totalStakedAmount && totalStakedAmount.greaterThan('0')) {
    userMobiRate = new TokenAmount(
      mobi,
      JSBI.divide(JSBI.multiply(stakingInfo?.mobiRate, stakedAmount?.raw), totalStakedAmount?.raw)
    )
  }
  const totalMobiRate = new TokenAmount(mobi, stakingInfo.mobiRate ?? JSBI.BigInt('0'))

  const userBalances = balances.map((amount) => {
    const fraction = new Fraction(stakedAmount.raw, totalStaked?.raw || JSBI.BigInt('0'))
    const ratio = fraction.multiply(amount.raw)
    if (JSBI.equal(ratio.denominator, JSBI.BigInt('0'))) {
      return new TokenAmount(amount.currency, JSBI.BigInt('0'))
    }
    return new TokenAmount(amount.currency, JSBI.divide(ratio.numerator, ratio.denominator))
  })

  const price1 = useCUSDPrice(tokens[0])
  const price2 = useCUSDPrice(tokens[1])
  const price = price1 ?? price2
  const priceOf = useQuote(price)

  // const [, stakingTokenPair] = usePair(tokenA, tokenB)
  // const singleStakingInfo = usePairStakingInfo(stakingTokenPair)
  // const dualStakingInfo = usePairDualStakingInfo(singleStakingInfo)
  // const isDualFarm = location.pathname.includes('dualfarm')

  //const stakingInfo = isDualFarm ? dualStakingInfo : singleStakingInfo

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.lpToken)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const token = stakingInfo.tokens[0]
  const backgroundColor = useColor(token ?? undefined)

  // get CUSD value of staked LP tokens

  const mobiCountUpAmount = earnedMobi?.toFixed(6) ?? '0'
  const mobiCountUpAmountPrevious = usePrevious(mobiCountUpAmount) ?? '0'
  const countUpAmount = earnedMobi?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>{stakingInfo.name} Liquidity Mining</TYPE.mediumHeader>
        <CurrencyPoolLogo tokens={stakingInfo.tokens.slice()} size={24} />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total deposits</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {totalStakedAmount
                ? `${stakingInfo.peggedTo}${
                    priceOf(totalStakedAmount).lessThan('1')
                      ? totalStakedAmount.toFixed(2, {
                          groupSeparator: ',',
                        })
                      : totalStakedAmount.toFixed(0, {
                          groupSeparator: ',',
                        })
                  }`
                : '-'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo
                ? totalMobiRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                : '0'}
              {' MOBI / week'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get MOBI-LP Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`Mobi-LP tokens are required. Once you've added liquidity to the ${stakingInfo.name} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary padding="8px" borderRadius="8px" width={'fit-content'} as={Link} to={`/pool`}>
                {`Add liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )}

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your liquidity deposits</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>MOBI-LP {stakingInfo.tokens.map(({ symbol }) => symbol).join('-')}</TYPE.white>
                  </RowFixed>
                </RowBetween>
                {stakingInfo?.stakedAmount && stakingInfo.stakedAmount.greaterThan('0') && (
                  <RowBetween>
                    <RowFixed>
                      <TYPE.white>
                        Current value:{' '}
                        {userStaked
                          ? `${stakingInfo.peggedTo}${priceOf(userStaked).toFixed(2, {
                              separator: ',',
                            })}`
                          : '--'}
                      </TYPE.white>
                      <QuestionHelper
                        text={userBalances
                          .map((balance) => `${balance?.toFixed(0, { groupSeparator: ',' })} ${balance.token.symbol}`)
                          .join(', ')}
                      />
                    </RowFixed>
                  </RowBetween>
                )}
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
            <CardNoise />
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your unclaimed rewards</TYPE.black>
                </div>
                {stakingInfo?.pendingMobi && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.pendingMobi) && (
                  <ButtonEmpty
                    padding="8px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => setShowClaimRewardModal(true)}
                  >
                    Claim
                  </ButtonEmpty>
                )}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={mobiCountUpAmount}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(mobiCountUpAmountPrevious)}
                    end={parseFloat(mobiCountUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {stakingInfo
                    ? userMobiRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  {' MOBI / week'}
                </TYPE.black>
              </RowBetween>
              {/* {isDualFarm && (
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.largeHeader fontSize={36} fontWeight={600}>
                    <CountUp
                      key={countUpAmount}
                      isCounting
                      decimalPlaces={4}
                      start={parseFloat(countUpAmountPrevious)}
                      end={parseFloat(countUpAmount)}
                      thousandsSeparator={','}
                      duration={1}
                    />
                  </TYPE.largeHeader>
                  <TYPE.black fontSize={16} fontWeight={500}>
                    <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                      ⚡
                    </span>
                    {dualStakingInfo?.active
                      ? dualStakingInfo?.rewardRate
                          ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                          ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                      : '0'}
                    {` ${dualStakingInfo?.rewardToken?.symbol} / week`}
                  </TYPE.black>
                </RowBetween>
              )} */}
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          When you withdraw, the contract will automagically claim MOBI on your behalf!
        </TYPE.main>

        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            {stakingInfo && (
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit MOBI-LP Tokens'}
              </ButtonPrimary>
            )}

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  Withdraw
                </ButtonPrimary>
              </>
            )}
            {/* {stakingInfo && !stakingInfo.active && (
              <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
                Staking Rewards inactive for this pair.
              </TYPE.main>
            )} */}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : !stakingInfo ? null : (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} MOBI LP tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}

const PairLinkIcon = styled(ExternalLinkIcon)`
  svg {
    stroke: ${(props) => props.theme.primary1};
  }
`
