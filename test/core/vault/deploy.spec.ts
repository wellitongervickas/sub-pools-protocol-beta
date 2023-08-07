import { expect } from 'chai'
import { loadFixture, vault } from '../../fixtures'
import { FAKE_STRATEGY } from '../../helpers/address'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set strategy on deploy', async function () {
      const { vaultContract } = await loadFixture(vault.deployVaultFixture)
      const strategyAddress = await vaultContract.strategy()

      expect(strategyAddress).to.equal(FAKE_STRATEGY)
    })
  })
})
