import { expect } from 'chai'
import { router, loadFixture } from '../fixtures'
import { createRandomAddress } from '../helpers/address'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set protocol ', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const newAddress = createRandomAddress()
      await routerContract.setProtocol(newAddress)

      expect(await routerContract.protocol()).to.be.equal(newAddress)
    })

    it('should revert if try to change protocol  without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, otherAccount] = accounts

      const newAddress = createRandomAddress()
      const otherAccountRouterInstance = routerContract.connect(otherAccount) as any

      await expect(otherAccountRouterInstance.setProtocol(newAddress)).to.be.revertedWithCustomError(
        otherAccountRouterInstance,
        'InvalidManager()'
      )
    })
  })
})
