import { ethers, vaultFactory, nodeFactory, loadFixture } from './'

export async function deployRegistryFixture() {
  const { nodeFactoryContract, nodeFactoryAddress } = await loadFixture(nodeFactory.deployNodeFactoryFixture)
  const { vaultFactoryAddress, vaultFactoryContract } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(nodeFactoryAddress, vaultFactoryAddress)
  const registryAddress = await registryContract.getAddress()

  return {
    accounts,
    registryContract,
    registryAddress,
    nodeFactoryContract,
    vaultFactoryAddress,
    nodeFactoryAddress,
    vaultFactoryContract,
  }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
