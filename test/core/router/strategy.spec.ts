import { expect } from 'chai'
import { loadFixture, router, anyValue, fakeStrategy, token, ethers } from '../../fixtures'

describe('Router', () => {
  describe('Strategy', () => {
    it('should emit Router_RequestStrategyVault on request', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.requestStrategyVault(fakeStrategyAddress))
        .to.emit(routerContract, 'Router_RequestStrategyVault')
        .withArgs(fakeStrategyAddress, anyValue)
    })

    it('should registry vault from strategy', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.requestStrategyVault(fakeStrategyAddress)
      const receipt = await tx.wait()

      const vaultAddress = receipt.logs[3].args[1]

      expect(await routerContract.vaults(fakeStrategyAddress)).to.be.equal(vaultAddress)
    })

    it('should registry strategy as untrusted', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.requestStrategyVault(fakeStrategyAddress)

      expect(await routerContract.isStrategyTrusted(fakeStrategyAddress)).to.be.false
    })

    it('should set strategy as trusted', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.requestStrategyVault(fakeStrategyAddress)
      await routerContract.trustStrategy(fakeStrategyAddress, true)

      expect(await routerContract.isStrategyTrusted(fakeStrategyAddress)).to.be.true
    })

    it('should emit RouterManager_StrategyTrust on trust strategy', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.requestStrategyVault(fakeStrategyAddress)

      await expect(routerContract.trustStrategy(fakeStrategyAddress, true))
        .to.emit(routerContract, 'RouterManager_StrategyTrust')
        .withArgs(fakeStrategyAddress, true)
    })

    it('should revert if try to change strategy trusted withotu being owner', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)

      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, hacker] = accounts

      await routerContract.requestStrategyVault(fakeStrategyAddress)
      const hackerRouter = routerContract.connect(hacker) as any

      await expect(hackerRouter.trustStrategy(fakeStrategyAddress, true)).to.be.revertedWithCustomError(
        hackerRouter,
        'Manager_Invalid()'
      )
    })
  })
})
