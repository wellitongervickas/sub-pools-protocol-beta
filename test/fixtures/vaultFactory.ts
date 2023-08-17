import { ethers } from './'

export async function deployVaultFactoryFixture() {
  const accounts = await ethers.getSigners()
  const VaultFactory = await ethers.getContractFactory('VaultFactory')
  const vaultFactoryContract = await VaultFactory.deploy()
  const vaultFactoryAddress = await vaultFactoryContract.getAddress()

  return { accounts, vaultFactoryContract, vaultFactoryAddress }
}

const fixtures = {
  deployVaultFactoryFixture,
}

export default fixtures
