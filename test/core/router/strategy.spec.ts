import { expect } from 'chai'
import { loadFixture, router, anyValue, fakeStrategy } from '../../fixtures'

describe('Router', () => {
  describe('RequestStrategyVault', () => {
    it('should emit Router_StrategyVaultRequest on request', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.requestStrategyVault(fakeStrategyAddress))
        .to.emit(routerContract, 'Router_StrategyVaultRequest')
        .withArgs(fakeStrategyAddress, anyValue)
    })
  })
})
