import { ethers } from 'hardhat'

export async function deployRegistryFixture() {
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy()

  return { accounts, registryContract }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
