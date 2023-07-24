import { expect } from 'chai'
import { router, fakeStrategySingle, loadFixture, anyValue } from '../fixtures'

describe('Router', () => {
  describe('Registry', () => {
    it('should create a registry contract', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      expect(await routerContract.registry(fakeStrategyAddress)).to.not.reverted
    })

    it('should emit RegistryCreated on registry', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.registry(fakeStrategyAddress))
        .to.emit(routerContract, 'RegistryCreated')
        .withArgs(anyValue)
    })

    it('should revert if try to use a registry without being the manager', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, otherAccount] = accounts

      const otherAccountRouterInstance = routerContract.connect(otherAccount) as any

      await expect(otherAccountRouterInstance.registry(fakeStrategyAddress)).to.be.revertedWithCustomError(
        otherAccountRouterInstance,
        'InvalidManager()'
      )
    })
  })
})
