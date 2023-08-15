import { expect } from 'chai'
import { loadFixture, vault } from '..'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set name', async function () {
      it('should set parent on deploy', async function () {
        const name = 'vUSDC'
        const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, undefined, name))
        const vaultName = await vaultContract.name()

        expect(vaultName).to.equal(name)
      })
    })
  })
})
