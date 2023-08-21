import { expect } from 'chai'
import { loadFixture, router } from '../fixtures'

describe('Router', () => {
  describe('Deploy', () => {
    describe('Node', () => {
      it('should set node factory address', async function () {
        const { routerContract, nodeFactoryAddress } = await loadFixture(router.deployRouterFixture)

        expect(await routerContract.nodeFactory()).to.equal(nodeFactoryAddress)
      })
    })

    describe('Vault', () => {
      it('should set vault factory address', async function () {
        const { routerContract, vaultFactoryAddress } = await loadFixture(router.deployRouterFixture)

        expect(await routerContract.vaultFactory()).to.equal(vaultFactoryAddress)
      })
    })
  })
})
