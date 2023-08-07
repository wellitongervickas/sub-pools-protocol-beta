import { ethers } from 'hardhat'
import { FAKE_STRATEGY } from '../helpers/address'

export async function deployVaultFixture(strategyAddress?: string) {
  const accounts = await ethers.getSigners()
  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(strategyAddress || FAKE_STRATEGY)

  return { accounts, vaultContract }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
