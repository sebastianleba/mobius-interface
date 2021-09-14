type OpticsDomainInfo = {
  chainId: number
  bridgeRouter: string
  domain: number
}

export const ETH_OPTICS: OpticsDomainInfo = {
  chainId: 1,
  bridgeRouter: '0x6a39909e805A3eaDd2b61fFf61147796ca6aBB47',
  domain: 6648936,
}

export const POLYGON_OPTICS: OpticsDomainInfo = {
  chainId: 137,
  bridgeRouter: '0xf244eA81F715F343040569398A4E7978De656bf6',
  domain: 1886350457,
}

export const CELO_OPTICS: OpticsDomainInfo = {
  chainId: 42220,
  bridgeRouter: '0xf244eA81F715F343040569398A4E7978De656bf6',
  domain: 1886350457,
}

export const OpticsMainnetDomains = [ETH_OPTICS, POLYGON_OPTICS, CELO_OPTICS]

export const ALFAJORES_OPTICS: OpticsDomainInfo = {
  chainId: 44787,
  bridgeRouter: '0xd6930Ee55C141E5Bb4079d5963cF64320956bb3E',
  domain: 1000,
}

export const KOVAN_OPTICS: OpticsDomainInfo = {
  chainId: 42,
  bridgeRouter: '0x359089D34687bDbFD019fCC5093fFC21bE9905f5',
  domain: 3000,
}

export const RINKEBY_OPTICS: OpticsDomainInfo = {
  chainId: 4,
  bridgeRouter: '0x8FbEA25D0bFDbff68F2B920df180e9498E9c856A',
  domain: 2000,
}

export const OpticsDevDomains = [ALFAJORES_OPTICS, KOVAN_OPTICS, RINKEBY_OPTICS]
