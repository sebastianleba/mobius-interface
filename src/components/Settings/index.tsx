import React, { useContext, useRef, useState } from 'react'
import { Settings, X } from 'react-feather'
import { Text } from 'rebass'
import { useUserAllowMoolaWithdrawal, useUserDisableSmartRouting, useUserMinApprove } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useIsDarkMode,
  useUserSingleHopOnly,
  useUserSlippageTolerance,
  useUserTransactionTTL,
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'

const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.text2};
  }

  :hover {
    opacity: 0.7;
  }
`

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  margin-top: 0rem;
  padding: 0;
  height: 35px;

  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
`
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.bg2};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0rem 0;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
`

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [minApprove, setMinApprove] = useUserMinApprove()
  const [allowMoolaWithdrawal, setAllowMoolaWithdrawal] = useUserAllowMoolaWithdrawal()
  const [disableSmartRouting, setDisableSmartRouting] = useUserDisableSmartRouting()
  const useUbeswap = false
  const isDarkMode = useIsDarkMode()

  const [ttl, setTtl] = useUserTransactionTTL()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="lg">
            <RowBetween style={{ padding: '0 2rem' }}>
              <div />
              <Text fontWeight={500} fontSize={20}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={20}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={600} fontSize={20}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <ButtonError
                error={true}
                padding={'12px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }
                }}
              >
                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        ) : null}{' '}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              Transaction Settings
            </Text>
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={ttl}
              setDeadline={setTtl}
            />
            {/* <Text fontWeight={600} fontSize={14}>
              Interface Settings
            </Text>
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Ubeswap Routing
                </TYPE.black>
                <QuestionHelper text="Allows trades to be routed through Ubeswap." />
              </RowFixed>
              <Toggle id="toggle-expert-mode-button" isActive={useUbeswap} toggle={() => setUseUbeswap(!useUbeswap)} />
            </RowBetween> */}

            {useUbeswap && (
              <>
                <RowBetween>
                  <RowFixed>
                    <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                      Toggle Expert Mode
                    </TYPE.black>
                    <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
                  </RowFixed>
                  <Toggle
                    id="toggle-expert-mode-button"
                    isActive={expertMode}
                    toggle={
                      expertMode
                        ? () => {
                            toggleExpertMode()
                            setShowConfirmation(false)
                          }
                        : () => {
                            toggle()
                            setShowConfirmation(true)
                          }
                    }
                  />
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                      Disable Multihops
                    </TYPE.black>
                    <QuestionHelper text="Restricts swaps to direct pairs only." />
                  </RowFixed>
                  <Toggle
                    id="toggle-disable-multihop-button"
                    isActive={singleHopOnly}
                    toggle={() => (singleHopOnly ? setSingleHopOnly(false) : setSingleHopOnly(true))}
                  />
                </RowBetween>{' '}
              </>
            )}
            <Text fontWeight={600} fontSize={14}>
              Routing Settings
            </Text>
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Use minimum approval
                </TYPE.black>
                <QuestionHelper text="Ensures that each individual trade requires approving the router for the transfer." />
              </RowFixed>
              <Toggle isActive={minApprove} toggle={() => (minApprove ? setMinApprove(false) : setMinApprove(true))} />
            </RowBetween>
            {useUbeswap && (
              <>
                <RowBetween>
                  <RowFixed>
                    <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                      Disable smart routing
                    </TYPE.black>
                    <QuestionHelper text="Disable using advanced routing techniques to optimize your trade execution price." />
                  </RowFixed>
                  <Toggle isActive={disableSmartRouting} toggle={() => setDisableSmartRouting(!disableSmartRouting)} />
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                      Allow Moola withdrawal
                    </TYPE.black>
                    <QuestionHelper text="Enables withdrawing collateral from Moola. This can cause you to get liquidated-- be careful!" />
                  </RowFixed>
                  <Toggle
                    isActive={allowMoolaWithdrawal}
                    toggle={() => setAllowMoolaWithdrawal(!allowMoolaWithdrawal)}
                  />
                </RowBetween>{' '}
              </>
            )}
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
