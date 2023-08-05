import { expect } from 'chai'
import { loadFixture, router, anyValue, fakeStrategy } from '../../fixtures'

describe('Router', () => {
  describe('Strategy', () => {
    it('should emit Router_StrategyCreateVaultRequest on request', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.createVault(fakeStrategyAddress))
        .to.emit(routerContract, 'Router_StrategyCreateVaultRequest')
        .withArgs(fakeStrategyAddress, anyValue)
    })
  })
})
