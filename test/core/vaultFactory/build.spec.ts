import { expect } from 'chai'
import { anyValue, ethers, loadFixture, vaultFactory, token } from '../../fixtures'
import { FAKE_STRATEGY, createRandomAddress } from '../../helpers/address'
import coderUtils from '../../helpers/coder'

describe('VaultFactory', () => {
  describe('Build', () => {
    it('should emit VaultFactory_VaultCreated when build', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()
      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategyContract = await FakeStrategy.deploy([tokenAddress])
      const fakeStrategyAddress = await fakeStrategyContract.getAddress()

      const { vaultFactoryContract } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

      await expect(vaultFactoryContract.build(fakeStrategyAddress))
        .to.emit(vaultFactoryContract, 'VaultFactory_VaultCreated')
        .withArgs(anyValue, fakeStrategyAddress)
    })

    it('should set the vault owner as the sender', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()
      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategyContract = await FakeStrategy.deploy([tokenAddress])
      const fakeStrategyAddress = await fakeStrategyContract.getAddress()

      const { vaultFactoryContract, accounts } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

      const [manager] = accounts

      const tx = await vaultFactoryContract.build(fakeStrategyAddress)
      const receipt = await tx.wait()

      const vaultContract = await ethers.getContractAt('Vault', receipt.logs[2].args[0])

      expect(await vaultContract.owner()).to.equal(manager.address)
    })
  })
})
