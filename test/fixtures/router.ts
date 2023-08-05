import { ethers } from 'hardhat'
import { loadFixture, nodeFactory, vaultFactory } from '.'

export async function deployRouterFixture() {
  const { vaultFactoryContract } = await loadFixture(vaultFactory.deployVaultFactoryFixture)
  const { nodeFactoryContract } = await loadFixture(nodeFactory.deployNodeFactoryFixture)
  const nodeFactoryAddress = await nodeFactoryContract.getAddress()
  const vaultFactoryAddress = await vaultFactoryContract.getAddress()

  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(nodeFactoryAddress, vaultFactoryAddress)

  return { accounts, routerContract, nodeFactoryAddress, vaultFactoryAddress }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
