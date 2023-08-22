import { ethers } from './'

export async function deployRegistryFixture() {
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy()
  const registryAddress = await registryContract.getAddress()

  return { accounts, registryContract, registryAddress }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
