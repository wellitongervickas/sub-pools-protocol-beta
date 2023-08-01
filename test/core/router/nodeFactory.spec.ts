import { expect } from 'chai'
import { ethers, loadFixture, router, nodeFactory } from '../../fixtures'
import { createRandomAddress } from '../../helpers/address'

describe('Router', () => {
  describe('NodeFactory', () => {
    it('should update node factory', async function () {
      const newNodeFactoryAddress = createRandomAddress()
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.updateNodeFactory(newNodeFactoryAddress)

      expect(await routerContract.nodeFactory()).to.equal(newNodeFactoryAddress)
    })

    it('should emit NodeFactory_Updated when update node factory', async function () {
      const newNodeFactoryAddress = createRandomAddress()
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.updateNodeFactory(newNodeFactoryAddress))
        .to.emit(routerContract, 'NodeFactory_Updated')
        .withArgs(newNodeFactoryAddress)
    })

    it('should revert if try to update node factory without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [_, notManager] = accounts

      const notManagerNodeFactoryContract = routerContract.connect(notManager) as any

      await expect(
        notManagerNodeFactoryContract.updateNodeFactory(createRandomAddress())
      ).to.be.revertedWithCustomError(routerContract, 'Manager_Invalid()')
    })
  })
})
