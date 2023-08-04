import { expect } from 'chai'
import { ethers, loadFixture, router, anyValue } from '../../fixtures'
import { FAKE_REGISTRY } from '../../helpers/address'

describe('Router', () => {
  describe('CreateNode', () => {
    it('should emit Router_NodeCreated on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.createNode([], FAKE_REGISTRY))
        .to.emit(routerContract, 'Router_NodeCreated')
        .withArgs(anyValue)
    })

    it('should set owner as the router itself', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.createNode([], FAKE_REGISTRY)
      const receipt = await tx.wait()

      const routerContractAddress = await routerContract.getAddress()

      const nodeContract = await ethers.getContractAt('Node', receipt.logs[4].args[0])

      expect(await nodeContract.owner()).to.equal(routerContractAddress)
    })

    it('should set manager as the sender', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [manager] = accounts

      const tx = await routerContract.createNode([], FAKE_REGISTRY)
      const receipt = await tx.wait()

      const nodeContract = await ethers.getContractAt('Node', receipt.logs[4].args[0])

      expect(await nodeContract.managerAddress()).to.equal(manager.address)
    })
  })
})
