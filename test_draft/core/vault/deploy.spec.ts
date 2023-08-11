import { expect } from 'chai'
import { loadFixture, ethers, vault, token } from '../../fixtures'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set adapter on deploy', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)

      const tokenAddress = await tokenContract.getAddress()
      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategyContract = await FakeStrategy.deploy([tokenAddress])

      const fakeStrategyAddress = await fakeStrategyContract.getAddress()

      const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, fakeStrategyAddress))

      const adapterAddress = await vaultContract.adapter()

      expect(adapterAddress).to.equal(fakeStrategyAddress)
    })
  })
})
