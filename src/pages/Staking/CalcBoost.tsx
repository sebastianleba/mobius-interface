import { Fraction, JSBI, TokenAmount } from '@ubeswap/sdk'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { useMobi, useVeMobi } from 'hooks/Tokens'
import { useColor } from 'hooks/useColor'
import { darken } from 'polished'
import React, { useState } from 'react'
import { tryParseAmount } from 'state/mento/hooks'
import { MobiStakingInfo, useMobiStakingInfo } from 'state/staking/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { theme, TYPE } from 'theme'
import { calcEstimatedBoost, calcVotesForMaxBoost } from 'utils/calcExpectedVeMobi'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useActiveContractKit } from '../../hooks'
import { useStablePoolInfo } from '../../state/stablePools/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import ClaimAllMobiModal from './ClaimAllMobiModal'
import { CurrencyRow } from './IncreaseLockAmount'

const Container = styled.div`
  width: 49%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%
`}
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any; activated: boolean }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 0.5rem;
  gap: 0.5rem;
  cursor: pointer;
  opacity: ${({ activated }) => (activated ? 1 : 0.9)};
  overflow: hidden;
  position: relative;
  background: ${({ bgColor, theme }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${theme.black} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
  &:hover {
    opacity: 1;
  }
`
const Divider = styled.div<{ bg?: string }>`
  width: 100%;
  height: 1px;
  background: ${({ theme, bg }) => (bg ? bg : theme.primary1)};
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`

const CurrencySelect = styled.button<{
  selected: boolean
  walletConnected: boolean
  bgColor: any
  isDarkMode: boolean
  pair: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  ${({ selected, bgColor, isDarkMode }) => selected && `background-color: ${darken(isDarkMode ? 0.2 : -0.4, bgColor)};`}
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  width: 22rem;
  height: 3rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 0.5rem;
  `}

  :focus,
  :hover {
    background-color: ${({ selected, theme, bgColor, isDarkMode }) =>
      selected ? darken(isDarkMode ? 0.2 : -0.3, bgColor) : darken(0.05, theme.primary1)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.white)};
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

type PositionsProps = {
  stakingInfo: MobiStakingInfo
  unclaimedMobi: TokenAmount
}
export default function CalcBoost({ stakingInfo }: PositionsProps) {
  const stablePools = useStablePoolInfo()
  const { account } = useActiveContractKit()
  const { positions = [] } = stakingInfo
  const loading = positions.length === 0
  const greaterThanZero = positions.filter(({ baseBalance }) => baseBalance.greaterThan('0'))
  const [openModal, setOpenModal] = useState(false)
  const mobi = useMobi()
  const vemobi = useVeMobi()
  const [lpInput, setLPInput] = useState<string>('')
  const [veInput, setVEInput] = useState<string>('')
  const pool = stablePools[0] ?? undefined
  const lpBalance = pool ? pool.amountDeposited : new TokenAmount(mobi, JSBI.BigInt(0))
  const veBalance = useCurrencyBalance(account, vemobi)
  const isDarkMode = useIsDarkMode()
  const color = useColor()
  const staking = useMobiStakingInfo()
  const stake = staking.positions
    ? staking.positions.filter((s) => s.address.toLowerCase() === pool.gaugeAddress?.toLowerCase())[0]
    : undefined

  if (!pool || !stake || !vemobi) return null

  const veParse = tryParseAmount(veInput, vemobi)
  const lpParse = tryParseAmount(lpInput, pool.lpToken)
  const boost =
    !veParse || !lpParse
      ? new Fraction(JSBI.BigInt(0))
      : calcEstimatedBoost(stake, veParse.raw, staking.totalVotingPower.raw, lpParse.raw)

  const votes = !lpParse
    ? new TokenAmount(vemobi, JSBI.BigInt(0))
    : calcVotesForMaxBoost(stake, staking.totalVotingPower.raw, lpParse.raw, vemobi)
  return (
    <Container>
      <ClaimAllMobiModal isOpen={openModal} onDismiss={() => setOpenModal(false)} summaries={greaterThanZero} />
      <RowBetween>
        <TYPE.largeHeader>Calculate Boosts</TYPE.largeHeader>
        <CurrencySelect
          isDarkMode={isDarkMode}
          bgColor={color}
          selected={true}
          walletConnected={!!account}
          pair={false}
          className="open-currency-select-button"
          // onClick={() => {
          //   setModalOpen(true)
          // }}
        >
          <Aligner>
            {pool ? (
              <DoubleCurrencyLogo currency0={pool.tokens[0]} currency1={pool.tokens[1]} size={24} margin={true} />
            ) : null}
            {pool ? (
              <StyledTokenName active={!!pool} className="pair-name-container">
                {pool.name}
              </StyledTokenName>
            ) : null}
            <StyledDropDown selected={true} />
          </Aligner>
        </CurrencySelect>
      </RowBetween>
      <Divider />
      <TYPE.mediumHeader marginBottom={0}>Select amount of LP tokens</TYPE.mediumHeader>
      <CurrencyRow val={lpInput} token={pool.lpToken} balance={lpBalance} setTokenAmount={setLPInput} />
      <TYPE.mediumHeader marginBottom={0}>Select amount of veMOBI</TYPE.mediumHeader>
      <CurrencyRow val={veInput} token={vemobi} balance={veBalance} setTokenAmount={setVEInput} />
      <Divider />
      <Wrapper>
        <RowBetween>
          <TYPE.largeHeader>Boost</TYPE.largeHeader>
          <TYPE.mediumHeader color={theme().primary1}>{boost.toFixed(2)}x</TYPE.mediumHeader>
        </RowBetween>
        <RowBetween>
          <TYPE.largeHeader>veMOBI to get max boost</TYPE.largeHeader>
          <TYPE.mediumHeader color={theme().primary1}>{votes.toFixed(2)}</TYPE.mediumHeader>
        </RowBetween>
      </Wrapper>
    </Container>
  )
}
