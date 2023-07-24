import { expect } from 'chai'
import { router, loadFixture } from '../fixtures'
import { createRandomAddress } from '../helpers/address'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set treasury address', async function () {
      const { routerContract, treasuryAddress } = await loadFixture(router.deployRouterFixture)

      const newTreasuryAddress = createRandomAddress()

      await routerContract.setTreasuryAddress(newTreasuryAddress)

      expect(await routerContract.treasuryAddress()).to.be.equal(newTreasuryAddress)
    })

    it('should revert if try to change treansury address without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, otherAccount] = accounts

      const otherAccountRouterInstance = routerContract.connect(otherAccount) as any

      await expect(otherAccountRouterInstance.setTreasuryAddress(otherAccount.address)).to.be.revertedWithCustomError(
        otherAccountRouterInstance,
        'InvalidManager()'
      )
    })
  })
})
