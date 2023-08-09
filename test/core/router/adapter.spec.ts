import { expect } from 'chai'
import { loadFixture, router, anyValue, fakeStrategy, token, ethers } from '../../fixtures'

describe('Router', () => {
  describe('Adapter', () => {
    it('should emit Router_RequestAdapterVault on request', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.requestAdapterVault(fakeStrategyAddress))
        .to.emit(routerContract, 'Router_RequestAdapterVault')
        .withArgs(fakeStrategyAddress, anyValue)
    })

    it('should registry vault from strategy', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.requestAdapterVault(fakeStrategyAddress)
      const receipt = await tx.wait()

      const vaultAddress = receipt.logs[3].args[1]

      expect(await routerContract.vaults(fakeStrategyAddress)).to.be.equal(vaultAddress)
    })

    it('should registry strategy as untrusted', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.requestAdapterVault(fakeStrategyAddress)

      expect(await routerContract.isAdapterTrusted(fakeStrategyAddress)).to.be.false
    })

    it('should set strategy as trusted', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.requestAdapterVault(fakeStrategyAddress)
      await routerContract.trustAdapter(fakeStrategyAddress, true)

      expect(await routerContract.isAdapterTrusted(fakeStrategyAddress)).to.be.true
    })

    it('should emit RouterManager_TrustAdapter on trust strategy', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.requestAdapterVault(fakeStrategyAddress)

      await expect(routerContract.trustAdapter(fakeStrategyAddress, true))
        .to.emit(routerContract, 'RouterManager_TrustAdapter')
        .withArgs(fakeStrategyAddress, true)
    })

    it('should revert if try to change strategy trusted withotu being owner', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategy.deployFakeStrategyFixture)

      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, hacker] = accounts

      await routerContract.requestAdapterVault(fakeStrategyAddress)
      const hackerRouter = routerContract.connect(hacker) as any

      await expect(hackerRouter.trustAdapter(fakeStrategyAddress, true)).to.be.revertedWithCustomError(
        hackerRouter,
        'Manager_Invalid()'
      )
    })
  })
})
