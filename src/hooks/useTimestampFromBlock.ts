import { useEffect, useState } from 'react'

import { useActiveContractKit } from '.'

export function useTimestampFromBlock(block: number | undefined): number | undefined {
  const { library } = useActiveContractKit()
  const [timestamp, setTimestamp] = useState<number>()
  useEffect(() => {
    async function fetchTimestamp() {
      if (block) {
        const blockData = await library?.getBlock(block)
        blockData && setTimestamp(blockData.timestamp)
      }
    }
    if (!timestamp) {
      fetchTimestamp()
    }
  }, [block, library, timestamp])
  return timestamp
}
