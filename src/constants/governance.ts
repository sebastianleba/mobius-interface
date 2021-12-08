export const GOVERNANCE_ADDRESS: { [chainId: number]: string } = {
  [44787]: '0xFEDd9e2801744135f8b1A6B35edBb6fCB8B8AA18',
}

export const DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS = 5

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS: { [chainId: number]: number } = {
  [44787]: DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
}
