import { ethers } from 'hardhat'

export async function deployVaultFixture(strategyAddress?: string) {
  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy()
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  const accounts = await ethers.getSigners()
  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(strategyAddress || fakeStrategyAddress)

  return { accounts, vaultContract, fakeStrategyContract, fakeStrategyAddress }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
