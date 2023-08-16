import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set owner as deployer', async function () {
      const { vaultContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const owner = await vaultContract.owner()
      expect(owner).to.equal(accounts[0].address)
    })

    it('should set token name on deploy', async function () {
      const name = 'Vault USDC Coin'
      const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, { name }))
      const vaultName = await vaultContract.name()
      expect(vaultName).to.equal(name)
    })

    it('should set token symbol on deploy', async function () {
      const symbol = 'vUSDC'
      const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, { symbol }))
      const vaultSymbol = await vaultContract.symbol()
      expect(vaultSymbol).to.equal(symbol)
    })
  })
})
