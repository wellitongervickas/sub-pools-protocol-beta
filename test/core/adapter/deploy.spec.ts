import { expect } from 'chai'
import { loadFixture, adapterVault } from '../../fixtures'

describe('AdapterVaultV1', () => {
  describe('Deploy', () => {
    it('should set name on deploy', async function () {
      const { adapterVaultContract } = await loadFixture(adapterVault.deployAdapterVaultFixture)

      expect(await adapterVaultContract.name()).to.equal('AdapterVault')
    })

    it('should set symbol on deploy', async function () {
      const { adapterVaultContract } = await loadFixture(adapterVault.deployAdapterVaultFixture)

      expect(await adapterVaultContract.symbol()).to.equal('AV')
    })
  })
})
