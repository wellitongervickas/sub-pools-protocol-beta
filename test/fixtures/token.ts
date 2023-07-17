import { ethers } from 'hardhat'

const DEFAULT_DECIMALS = 18

export async function deployTokenFixture(
  initialSupply = `${1 * 10 ** DEFAULT_DECIMALS}`,
  decimals = DEFAULT_DECIMALS,
  name = 'ERC20 Token',
  symbol = 'ERC20'
) {
  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(initialSupply, name, symbol, decimals)

  return { accounts, tokenContract }
}

const fixtures = {
  deployTokenFixture,
}

export default fixtures
