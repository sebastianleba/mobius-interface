export const GOVERNANCE_ADDRESS: { [chainId: number]: string } = {
  [44787]: '0xc91fA5ce8B13D0a2228aEaA7316574e6B1005E25',
}

export const DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS = 5

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS: { [chainId: number]: number } = {
  [44787]: DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
}
