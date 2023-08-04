import { expect } from 'chai'
import { loadFixture, router } from '../../fixtures'
import { createRandomAddress } from '../../helpers/address'

describe('Router', () => {
  describe('NodeFactory', () => {
    it('should update node factory', async function () {
      const newStrategyProxyFactoryAddress = createRandomAddress()
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.updateStrategyProxyFactory(newStrategyProxyFactoryAddress)

      expect(await routerContract.strategyProxyFactory()).to.equal(newStrategyProxyFactoryAddress)
    })

    it('should emit RouterManager_StrategyProxyFactoryUpdated when update strategy proxy factory', async function () {
      const newStrategyProxyFactoryAddress = createRandomAddress()
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.updateStrategyProxyFactory(newStrategyProxyFactoryAddress))
        .to.emit(routerContract, 'RouterManager_StrategyProxyFactoryUpdated')
        .withArgs(newStrategyProxyFactoryAddress)
    })

    it('should revert if try to update node factory without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [_, notManager] = accounts

      const notManagerNodeFactoryContract = routerContract.connect(notManager) as any

      await expect(
        notManagerNodeFactoryContract.updateStrategyProxyFactory(createRandomAddress())
      ).to.be.revertedWithCustomError(routerContract, 'Manager_Invalid()')
    })
  })
})
