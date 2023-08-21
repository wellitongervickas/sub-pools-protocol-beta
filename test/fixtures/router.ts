import { ethers, vaultFactory, nodeFactory, loadFixture } from './'

export async function deployRouterFixture() {
  const { nodeFactoryContract, nodeFactoryAddress } = await loadFixture(nodeFactory.deployNodeFactoryFixture)
  const { vaultFactoryAddress, vaultFactoryContract } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(nodeFactoryAddress, vaultFactoryAddress)
  const routerAddress = await routerContract.getAddress()

  return {
    accounts,
    routerContract,
    routerAddress,
    nodeFactoryContract,
    vaultFactoryAddress,
    nodeFactoryAddress,
    vaultFactoryContract,
  }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
