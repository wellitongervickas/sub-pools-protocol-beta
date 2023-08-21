import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'

describe('Registry', () => {
  describe('Deploy', () => {
    describe('Node', () => {
      it('should set node factory address', async function () {
        const { registryContract, nodeFactoryAddress } = await loadFixture(registry.deployRegistryFixture)

        expect(await registryContract.nodeFactory()).to.equal(nodeFactoryAddress)
      })
    })

    describe('Vault', () => {
      it('should set vault factory address', async function () {
        const { registryContract, vaultFactoryAddress } = await loadFixture(registry.deployRegistryFixture)

        expect(await registryContract.vaultFactory()).to.equal(vaultFactoryAddress)
      })
    })
  })
})
