export const GOVERNANCE_ADDRESS = ''

export const DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS = 5

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS: { [chainId: number]: number } = {
  [44787]: DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
}
