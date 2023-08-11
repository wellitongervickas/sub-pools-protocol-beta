import { expect } from 'chai'
import { loadFixture, router } from '../../fixtures'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set node factory on deploy', async function () {
      const { routerContract, nodeFactoryAddress } = await loadFixture(router.deployRouterFixture)
      expect(await routerContract.nodeFactory()).to.equal(nodeFactoryAddress)
    })

    it('should set vault factory on deploy', async function () {
      const { routerContract, vaultFactoryAddress } = await loadFixture(router.deployRouterFixture)
      expect(await routerContract.vaultFactory()).to.equal(vaultFactoryAddress)
    })
  })
})
