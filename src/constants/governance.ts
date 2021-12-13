export const GOVERNANCE_ADDRESS: { [chainId: number]: string } = {
  [42220]: '0xB4EdE83B375fa524Dd9FC92581a060A428Cb6B7e',
  [44787]: '0xA878C6787490c9f0d2406bcd161b61f128Ab2708',
}

export const DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS = 5

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS: { [chainId: number]: number } = {
  [44787]: DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
}
