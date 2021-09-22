import { OpticsDomainInfo } from 'constants/Optics'
import { darken } from 'polished'
import React from 'react'
import { ArrowDown } from 'react-feather'
import styled, { css, keyframes } from 'styled-components'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useActiveContractKit } from '../../hooks'
import useTheme from '../../hooks/useTheme'
import { useIsDarkMode } from '../../state/user/hooks'
import { AutoRow } from '../Row'
import { ArrowWrapper } from '../swap/styleds'
import { ChainSelect } from './ChainSelect'

const ColorShift = keyframes`
0% { background: red;}
10% { background: blue;}
35% { background: purple; color: black !important;}
60% { background: orange;}
85% { background: green;}
100% { background: red;}`

const ColorShiftAnimation = css`
  animation: ${ColorShift} 8s linear infinite;
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const InputDiv = styled.div`
  display: flex;
  min-width: 40%;
`

const CurrencySelect = styled.button<{
  selected: boolean
  walletConnected: boolean
  bgColor: any
  isDarkMode: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  ${({ selected, bgColor, isDarkMode }) =>
    selected && `background-color: ${darken(isDarkMode ? 0.2 : -0.425, bgColor)};`}
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  ${({ selected }) => !selected && ColorShiftAnimation}
  cursor: pointer;
  user-select: none;
  border: none;
  width: 10rem;
  height: 3rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 0.5rem;
  `}

  :focus,
  :hover {
    background-color: ${({ selected, theme, bgColor, isDarkMode }) =>
      selected ? darken(isDarkMode ? 0.25 : -0.35, bgColor) : darken(0.05, theme.primary1)};
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.bg2};
  z-index: 1;
  width: 100%;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
  padding: 0.5rem;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.white)};
`

const StyledBalanceMax = styled.button`
  marginleft: auto;
  height: 28px;
  background-color: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.white};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.primary5};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.primary5};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface PropType {
  baseNetwork?: OpticsDomainInfo
  setBaseNetwork: (n: OpticsDomainInfo | undefined) => void
  targetNetwork?: OpticsDomainInfo
  setTargetNetwork: (n: OpticsDomainInfo | undefined) => void
  setApprovalSubmitted: (b: boolean) => void
}
export function ChainSelector({ baseNetwork, setBaseNetwork, targetNetwork, setTargetNetwork }: PropType) {
  const hideInput = false
  const isDarkMode = useIsDarkMode()
  const { account } = useActiveContractKit()
  const theme = useTheme()

  return (
    <InputPanel id={'chain-selector'}>
      <Container hideInput={false}>
        <LabelRow>From</LabelRow>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!!baseNetwork}>
          <ChainSelect
            selectedNetwork={baseNetwork}
            setSelectedNetwork={setBaseNetwork}
            otherSelectedNetwork={targetNetwork}
          />
        </InputRow>
        <AutoRow justify="center">
          <ArrowWrapper clickable>
            <ArrowDown
              size="16"
              onClick={() => {
                setApprovalSubmitted(false) // reset 2 step UI for approvals
                const base = baseNetwork
                const target = targetNetwork
                setBaseNetwork(target)
                setTargetNetwork(base)
              }}
              color={theme.primary1}
            />
          </ArrowWrapper>
        </AutoRow>
        <LabelRow>To</LabelRow>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!!baseNetwork}>
          <ChainSelect
            selectedNetwork={targetNetwork}
            setSelectedNetwork={setTargetNetwork}
            otherSelectedNetwork={baseNetwork}
          />
        </InputRow>
      </Container>
    </InputPanel>
  )
}
