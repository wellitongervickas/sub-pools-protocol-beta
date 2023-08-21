import { ethers } from './'

export async function deployNodeFactoryFixture() {
  const accounts = await ethers.getSigners()
  const NodeFactory = await ethers.getContractFactory('NodeFactory')
  const nodeFactoryContract = await NodeFactory.deploy()
  const nodeFactoryAddress = await nodeFactoryContract.getAddress()

  return { accounts, nodeFactoryContract, nodeFactoryAddress }
}

const fixtures = {
  deployNodeFactoryFixture,
}

export default fixtures
