import { expect } from 'chai'
import { loadFixture, ethers, vault, token } from '../../fixtures'
import coderUtils from '../../helpers/coder'

describe('Vault', () => {
  describe('Deploy', () => {
    it('should set strategy on deploy', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)

      const tokenAddress = await tokenContract.getAddress()
      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategyContract = await FakeStrategy.deploy(coderUtils.build([[tokenAddress]], ['address[]']))

      const fakeStrategyAddress = await fakeStrategyContract.getAddress()

      const { vaultContract } = await loadFixture(vault.deployVaultFixture.bind(this, fakeStrategyAddress))
      const strategyAddress = await vaultContract.strategy()

      expect(strategyAddress).to.equal(fakeStrategyAddress)
    })
  })
})
