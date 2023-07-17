import { ethers } from 'hardhat'

export async function deployTokenFixture(initialSupply: number, decimals = 18, name = 'ERC20 Token', symbol = 'ERC20') {
  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')
  const _initialSupply = ethers.toBigInt(initialSupply * 10 ** decimals)
  const tokenContract = await Token.deploy(_initialSupply, name, symbol, decimals)

  return { accounts, tokenContract }
}

const fixtures = {
  deployTokenFixture,
}

export default fixtures
