import { ethers } from 'hardhat'
import { loadFixture, token } from '.'

export async function deployVaultFixture(strategyAddress?: string) {
  const accounts = await ethers.getSigners()
  const { tokenContract } = await loadFixture(token.deployTokenFixture)
  const tokenAddress = await tokenContract.getAddress()

  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy([tokenAddress])
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(strategyAddress || fakeStrategyAddress)

  await fakeStrategyContract.transferOwnership(await vaultContract.getAddress())

  return {
    accounts,
    vaultContract,
    fakeStrategyContract,
    fakeStrategyAddress,
    tokenAddress,
    tokenContract,
  }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
