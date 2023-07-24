import { expect } from 'chai'
import { router, loadFixture } from '../fixtures'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set manager address', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [manager] = accounts

      expect(await routerContract.hasRoleManager(manager.address)).to.be.true
    })

    it('should set treasury address', async function () {
      const { routerContract, treasuryAddress } = await loadFixture(router.deployRouterFixture)

      expect(await routerContract.treasury()).to.be.equal(treasuryAddress)
    })

    it('should revert if try to change treansury address without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, otherAccount] = accounts

      const otherAccountRouterInstance = routerContract.connect(otherAccount) as any

      await expect(otherAccountRouterInstance.setTreasury(otherAccount.address)).to.be.revertedWithCustomError(
        otherAccountRouterInstance,
        'InvalidManager()'
      )
    })
  })
})
