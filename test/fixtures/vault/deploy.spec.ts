import { expect } from 'chai'
import { loadFixture, vault } from '..'
import { createRandomAddress } from '../../helpers/address'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set name', async function () {
      const name = 'vUSDC'

      const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, { name }))

      const vaultName = await vaultContract.name()

      expect(vaultName).to.equal(name)
    })

    it('should set registry role', async function () {
      const registryAddress = createRandomAddress()
      const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, { registry: registryAddress }))
      expect(await vaultContract.hasRegistryRole(registryAddress)).to.be.true
    })
  })
})
