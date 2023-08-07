import { ethers } from 'hardhat'

export async function deployVaultFixture(strategyAddress?: string) {
  const supply = '1000000000000000000000000'
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(supply, 18)
  const tokenAddress = await tokenContract.getAddress()

  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy([tokenAddress])
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  const accounts = await ethers.getSigners()
  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(strategyAddress || fakeStrategyAddress)

  return { accounts, vaultContract, fakeStrategyContract, fakeStrategyAddress, tokenAddress, tokenContract, supply }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
