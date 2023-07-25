import { expect } from 'chai'
import { router, loadFixture } from '../fixtures'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set manager address', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [manager] = accounts

      expect(await routerContract.hasRoleManager(manager.address)).to.be.true
    })

    it('should set protocol fees', async function () {
      const { routerContract, protocolAddress } = await loadFixture(router.deployRouterFixture)
      expect(await routerContract.protocol()).to.be.equal(protocolAddress)
    })
  })
})
