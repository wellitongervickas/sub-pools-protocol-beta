import { ethers } from 'hardhat'

export const DEFAULT_DECIMALS = 18

export const DEFAULT_SUPPLY = '1000000000000000000000000'

export async function deployTokenFixture(initialSupply = DEFAULT_SUPPLY, decimals = DEFAULT_DECIMALS) {
  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(initialSupply, decimals)

  return { accounts, tokenContract }
}

const fixtures = {
  deployTokenFixture,
}

export default fixtures
