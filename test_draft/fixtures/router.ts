import { ethers } from 'hardhat'

export async function deployRouterFixture() {
  const VaultFactory = await ethers.getContractFactory('VaultFactory')
  const vaultFactoryContract = await VaultFactory.deploy()

  const NodeFactory = await ethers.getContractFactory('NodeFactory')
  const nodeFactoryContract = await NodeFactory.deploy()

  const nodeFactoryAddress = await nodeFactoryContract.getAddress()
  const vaultFactoryAddress = await vaultFactoryContract.getAddress()

  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(nodeFactoryAddress, vaultFactoryAddress)

  return { accounts, routerContract, nodeFactoryAddress, vaultFactoryAddress, vaultFactoryContract }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
