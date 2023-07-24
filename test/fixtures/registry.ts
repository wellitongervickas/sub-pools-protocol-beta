import { ethers } from 'hardhat'

export async function deployRegistryFixture(strategy: string, manager: string) {
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(strategy, manager || accounts[0].address)

  return { accounts, registryContract }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
