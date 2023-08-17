import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'

describe('Registry', () => {
  describe('Deploy', () => {
    it('should set vault factory on deploy', async function () {
      const { registryContract, vaultFactoryAddress } = await loadFixture(registry.deployRegistryFixture)
      const vaultFactory = await registryContract.vaultFactory()
      expect(vaultFactory).to.equal(vaultFactoryAddress)
    })

    it('should set registry manager on deploy', async function () {
      const { registryContract, accounts } = await loadFixture(registry.deployRegistryFixture)
      expect(await registryContract.hasRoleManager(accounts[0].address)).to.be.true
    })
  })
})
