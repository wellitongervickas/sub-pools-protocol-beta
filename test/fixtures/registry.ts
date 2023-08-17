import { ethers, vaultFactory, loadFixture } from './'

export async function deployVaultFactoryFixture() {
  const { vaultFactoryAddress } = await loadFixture(vaultFactory.deployVaultFactoryFixture)
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(vaultFactoryAddress, accounts[0].address)
  const registryAddress = await registryContract.getAddress()

  return { accounts, registryAddress, registryContract, vaultFactoryAddress }
}

const fixtures = {
  deployVaultFactoryFixture,
}

export default fixtures
