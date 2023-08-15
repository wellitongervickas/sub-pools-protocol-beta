import { ethers } from 'hardhat'

export type IDeployTokenFixtureProps = {
  initialSupply?: string
  name?: string
  symbol?: string
  decimals?: number
}

export const DEFAULT_DECIMALS = 18
export const DEFAULT_SUPPLY = '1000000000000000000000000'
export const DEFAULT_NAME = 'Token'
export const DEFAULT_SYMBOL = 'TK'

export const DEFAULT_PROPS: IDeployTokenFixtureProps = {
  initialSupply: DEFAULT_SUPPLY,
  name: DEFAULT_NAME,
  symbol: DEFAULT_SYMBOL,
  decimals: DEFAULT_DECIMALS,
}

export async function deployTokenFixture({
  initialSupply,
  symbol,
  name,
  decimals,
}: IDeployTokenFixtureProps = DEFAULT_PROPS) {
  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(initialSupply, name, symbol, decimals)

  return { tokenContract, accounts }
}

const fixtures = {
  deployTokenFixture,
  DEFAULT_PROPS,
  DEFAULT_DECIMALS,
  DEFAULT_SUPPLY,
  DEFAULT_NAME,
  DEFAULT_SYMBOL,
}

export default fixtures
