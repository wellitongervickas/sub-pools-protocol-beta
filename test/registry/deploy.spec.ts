import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'

describe('Registry', () => {
  describe('Deploy', () => {
    it('should set vault factory on deploy', async function () {
      const { registryContract, vaultFactoryAddress } = await loadFixture(registry.deployRegistryFixture)
      const vaultFactory = await registryContract.vaultFactory()
      expect(vaultFactory).to.equal(vaultFactoryAddress)
    })
  })
})
