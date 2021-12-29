import { ErrorBoundary } from '@sentry/react'
import { cUSD, JSBI, TokenAmount } from '@ubeswap/sdk'
import QuestionHelper from 'components/QuestionHelper'
import { RowFixed } from 'components/Row'
import { Chain, Coins, PRICE } from 'constants/StablePools'
import { useActiveContractKit } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import React from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { useCUSDPrice } from 'utils/useCUSDPrice'

import { AutoColumn } from '../../components/Column'
import { StablePoolCard } from '../../components/earn/StablePoolCard'
import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { Row, RowBetween } from '../../components/Row'
import { InfoWrapper } from '../../components/swap/styleds'
import { StablePoolInfo, useStablePoolInfo } from '../../state/stablePools/hooks'
import { TYPE } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  justify-self: center;
  background: radial-gradient(90% 90% at 50% 5%, #fbcc5c 0%, #fb7c6d 100%);
  width: 100%;
  max-width: 640px;
  overflow: hidden;
  margin-bottom: 4rem;
  align-items: center;
  justify-content: center;
  display: flex;
  position: relative;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg1};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  align-items: center;
`

const Sel = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: ${({ selected }) => (selected ? '12px' : '3rem')};
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme, selected }) => (selected ? theme.white : theme.text1)};
  font-size: 1rem;
  font-weight: ${({ selected }) => (selected ? '999' : '300')};
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  background-color: ${({ theme, selected }) => (selected ? theme.celoGreen : theme.bg1)};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `}
`

export default function Pool() {
  const { chainId } = useActiveContractKit()

  const stablePools = useStablePoolInfo()

  const [selection, setSelection] = React.useState<Chain>(Chain.All)
  const [showDeprecated, setShowDeprecated] = React.useState(false)

  const tvl = stablePools.reduce((accum, poolInfo) => {
    const price =
      poolInfo.poolAddress === '0x19260b9b573569dDB105780176547875fE9fedA3'
        ? JSBI.BigInt(PRICE[Coins.Bitcoin])
        : poolInfo.poolAddress === '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a'
        ? JSBI.BigInt(PRICE[Coins.Ether])
        : JSBI.BigInt(PRICE[Coins.USD])
    const lpPrice = JSBI.divide(
      JSBI.multiply(price, poolInfo.virtualPrice),
      JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
    )
    const priceDeposited = JSBI.multiply(poolInfo?.totalDeposited?.raw ?? JSBI.BigInt('0'), lpPrice)
    return JSBI.add(accum, priceDeposited)
  }, JSBI.BigInt('0'))
  const tvlAsTokenAmount = new TokenAmount(cUSD[chainId], tvl)
  const mobiprice = useCUSDPrice(useMobi())

  const sortCallback = (pool1: StablePoolInfo, pool2: StablePoolInfo) => {
    const isStaking1 = pool1.amountDeposited?.greaterThan(JSBI.BigInt('0')) || pool1.stakedAmount.greaterThan('0')
    const isStaking2 = pool2.amountDeposited?.greaterThan(JSBI.BigInt('0')) || pool2.stakedAmount.greaterThan('0')
    if (isStaking1 && !isStaking2) return false
    return true
  }

  const sortedFilterdPools = stablePools
    ?.sort(sortCallback)
    .filter((pool) => selection === Chain.All || selection === pool.displayChain)

  return (
    <PageWrapper gap="lg" justify="center" style={{ marginTop: isMobile ? '-1rem' : '3rem' }}>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        <TYPE.tvlHeader>TVL: ${tvlAsTokenAmount.toFixed(0, { groupSeparator: ',' })}</TYPE.tvlHeader>
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        {mobiprice && <TYPE.price opacity={'.8'}>Latest MOBI Price: ${mobiprice.toFixed(3)}</TYPE.price>}
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <HeaderLinks>
          <Sel onClick={() => setSelection(Chain.All)} selected={selection === Chain.All}>
            ALL
          </Sel>
          <Sel onClick={() => setSelection(Chain.Celo)} selected={selection === Chain.Celo}>
            CELO
          </Sel>
          <Sel onClick={() => setSelection(Chain.Ethereum)} selected={selection === Chain.Ethereum}>
            ETH
          </Sel>
          <Sel onClick={() => setSelection(Chain.Polygon)} selected={selection === Chain.Polygon}>
            POLY
          </Sel>
          <Sel onClick={() => setSelection(Chain.Solana)} selected={selection === Chain.Solana}>
            SOL
          </Sel>
          <Sel onClick={() => setSelection(Chain.Avax)} selected={selection === Chain.Avax}>
            AVAX
          </Sel>
        </HeaderLinks>
        <InfoWrapper mobile={true} style={{ maxWidth: '640px' }}>
          <VoteCard>
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600} fontSize={20}>
                    Use caution when depositing
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white
                    fontSize={16}
                  >{`Please use caution when providing liquidity into pools. Do your own research to understand the stablility mechanisms behind each token, especially PoofCash p-tokens. Mobius does not guarantee the value of any asset.`}</TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <CardNoise />
          </VoteCard>
        </InfoWrapper>
        <PoolSection>
          {stablePools && stablePools?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : (
            sortedFilterdPools
              .filter((pool) => !pool.isKilled && !pool.disabled)
              .map((pool) => (
                <ErrorBoundary key={pool.poolAddress || '000'}>
                  <StablePoolCard poolInfo={pool} />
                </ErrorBoundary>
              ))
          )}
        </PoolSection>
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center' }}>
          <RowFixed>
            <TYPE.largeHeader
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => setShowDeprecated(!showDeprecated)}
            >
              {showDeprecated ? 'Hide deprecated pools' : 'Show deprecated pools'}
            </TYPE.largeHeader>
            <QuestionHelper
              text={<>The gauge for these pools have been killed and will no longer produce any mobi rewards</>}
            />
          </RowFixed>
        </AutoColumn>
        <PoolSection>
          {showDeprecated &&
            sortedFilterdPools
              .filter((pool) => pool.isKilled || pool.disabled)
              .map((pool) => (
                <ErrorBoundary key={pool.poolAddress || '000'}>
                  <StablePoolCard poolInfo={pool} />
                </ErrorBoundary>
              ))}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
