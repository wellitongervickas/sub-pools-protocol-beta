import { ethers } from 'hardhat'

export async function deployVaultFactoryFixture() {
  const accounts = await ethers.getSigners()
  const VaultFactory = await ethers.getContractFactory('VaultFactory')
  const vaultFactoryContract = await VaultFactory.deploy()

  return { accounts, vaultFactoryContract }
}

const fixtures = {
  deployVaultFactoryFixture,
}

export default fixtures
