import { ethers } from 'hardhat'

export const DEFAULT_DECIMALS = 18
export const DEFAULT_SUPPLY = '1000000000000000000000000'
export const DEFAULT_NAME = 'Token'
export const DEFAULT_SYMBOL = 'TK'

export async function deployTokenFixture(
  initialSupply = DEFAULT_SUPPLY,
  name = DEFAULT_NAME,
  symbol = DEFAULT_SYMBOL,
  decimals = DEFAULT_DECIMALS
) {
  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(initialSupply, name, symbol, decimals)

  return { accounts, tokenContract }
}

const fixtures = {
  deployTokenFixture,
  DEFAULT_DECIMALS,
  DEFAULT_SUPPLY,
  DEFAULT_NAME,
  DEFAULT_SYMBOL,
}

export default fixtures
