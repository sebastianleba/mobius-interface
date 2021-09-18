import * as UbeswapDefaultList from '@ubeswap/default-token-list'
import * as UbeswapExperimentalList from '@ubeswap/default-token-list/ubeswap-experimental.token-list.json'
import { ChainId, Token } from '@ubeswap/sdk'
import { STATIC_POOL_INFO } from 'constants/StablePools'
import Vibrant from 'node-vibrant'
import { shade } from 'polished'
import { useLayoutEffect, useState } from 'react'
import { useTheme } from 'styled-components'
import uriToHttp from 'utils/uriToHttp'
import { hex } from 'wcag-contrast'

const images: Record<string, string> = {}

const stablePoolTokens = Object.values(STATIC_POOL_INFO)
  .flatMap((pools) => pools)
  .flatMap(({ tokens }) => tokens)

UbeswapDefaultList.tokens
  .concat(UbeswapExperimentalList.tokens)
  .concat(stablePoolTokens)
  .forEach((token) => {
    images[token.address] = token.logoURI
  })

async function getColorFromToken(token: Token): Promise<string | null> {
  if (token.chainId === ChainId.ALFAJORES && token.address === '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735') {
    return Promise.resolve('#FAAB14')
  }

  const path = images[token.address]
  if (!path) {
    return '#FAAB14'
  }

  return Vibrant.from(path)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        let detectedHex = palette.Vibrant.hex
        let AAscore = hex(detectedHex, '#FFF')
        while (AAscore < 3) {
          detectedHex = shade(0.005, detectedHex)
          AAscore = hex(detectedHex, '#FFF')
        }
        return detectedHex
      }
      return null
    })
    .catch(() => null)
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0]

  return Vibrant.from(formattedPath)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        return palette.Vibrant.hex
      }
      return null
    })
    .catch(() => null)
}

// background: ${({ bgColor1, bgColor2 }) =>
// `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor1} 0%, ${bgColor2} 100%) `};

export function generateGradient(tokens: Token[]) {
  const prevColor = ''
  let colors = tokens.map((t) => useColor(t))
  console.log(colors)
  const numColors = colors.length + 1
  const increment = 100 / numColors
  colors = colors.map((color, i) => `${color} ${i * increment}%`)
  colors.push('#212429 100%')

  return `radial-gradient(91.85% 100% at 1.84% 0%, ${colors.join(', ')})`
}

export function generateColorPallete(tokens: Token[]) {
  const prevColor = ''
  let colors = tokens.map((t) => useColor(t))
  const increment = 100 / colors.length
  colors = colors.map((color, i) => `${i * increment}% { background: ${color};}`)

  return colors.join('\n')
}

export function useColor(token?: Token) {
  const theme = useTheme()
  const [color, setColor] = useState(theme.primary1)

  useLayoutEffect(() => {
    let stale = false

    if (token) {
      getColorFromToken(token).then((tokenColor) => {
        if (!stale && tokenColor !== null) {
          setColor(tokenColor)
        }
      })
    }

    return () => {
      stale = true
      setColor('#2172E5')
    }
  }, [token])

  return color
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#2172E5')

  useLayoutEffect(() => {
    let stale = false

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then((color) => {
        if (!stale && color !== null) {
          setColor(color)
        }
      })
    }

    return () => {
      stale = true
      setColor('#2172E5')
    }
  }, [listImageUri])

  return color
}
