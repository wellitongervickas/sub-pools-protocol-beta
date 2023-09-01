import { ethers } from 'hardhat'

export const DEFAULT_SUPPLY = '1000000000000000000000000'
export const DEFAULT_NAME = 'Meme Coin'
export const DEFAULT_SYMBOL = 'MMCN'
export const DEFAULT_DECIMALS = 18

export async function deployTokenFixture() {
  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(DEFAULT_SUPPLY, DEFAULT_NAME, DEFAULT_SYMBOL, DEFAULT_DECIMALS)
  const tokenAddress = await tokenContract.getAddress()

  return { accounts, tokenContract, tokenAddress }
}

const fixtures = {
  deployTokenFixture,
}

export default fixtures
