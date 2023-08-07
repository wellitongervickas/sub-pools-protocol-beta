import { ethers } from 'hardhat'
import coderUtils from '../helpers/coder'

export async function deployVaultFixture(strategyAddress?: string) {
  const accounts = await ethers.getSigners()
  const supply = '1000000000000000000000000'
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(supply, 18)
  const tokenAddress = await tokenContract.getAddress()

  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy(coderUtils.build([[tokenAddress]], ['address[]']))
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(strategyAddress || fakeStrategyAddress)

  return {
    accounts,
    vaultContract,
    fakeStrategyContract,
    fakeStrategyAddress,
    tokenAddress,
    tokenContract,
    supply,
  }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
