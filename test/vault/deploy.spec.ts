import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set owner as deployer', async function () {
      const { vaultContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const owner = await vaultContract.owner()
      expect(owner).to.equal(accounts[0].address)
    })
  })
})
