import { expect } from 'chai'
import { ethers, loadFixture, router } from '../../fixtures'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set node factory on deploy', async function () {
      const { routerContract, nodeFactoryAddress } = await loadFixture(router.deployRouterFixture)

      expect(await routerContract.nodeFactory()).to.equal(nodeFactoryAddress)
    })
  })
})
