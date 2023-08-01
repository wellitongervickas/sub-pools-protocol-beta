import { ethers } from 'hardhat'

export async function deployNodeFactoryFixture() {
  const accounts = await ethers.getSigners()
  const NodeFactory = await ethers.getContractFactory('NodeFactory')
  const nodeFactoryContract = await NodeFactory.deploy()

  return { accounts, nodeFactoryContract }
}

const fixtures = {
  deployNodeFactoryFixture,
}

export default fixtures
