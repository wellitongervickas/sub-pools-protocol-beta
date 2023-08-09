import { expect } from 'chai'
import { ethers, loadFixture, vault } from '../../fixtures'
import { FAKE_PARENT } from '../../helpers/address'

describe('Vault', () => {
  describe('Position', () => {
    it('should emit Vault_Deposited on add position', async function () {
      const { vaultContract, tokenContract, fakeStrategyAddress, accounts } = await loadFixture(
        vault.deployVaultFixture
      )

      const vaultContractAddress = await vaultContract.getAddress()
      const manager = accounts[0]
      const encodedAmount = [100]

      await tokenContract.approve(vaultContractAddress, 100)

      await expect(vaultContract.deposit(manager, encodedAmount))
        .to.emit(vaultContract, 'Vault_Deposited')
        .withArgs(1, encodedAmount)
    })

    it('should create an account', async function () {
      const { vaultContract, accounts, tokenContract } = await loadFixture(vault.deployVaultFixture)
      const manager = accounts[0]

      const vaultContractAddress = await vaultContract.getAddress()
      const encodedAmount = [100]

      await tokenContract.approve(vaultContractAddress, 100)
      await vaultContract.deposit(manager, encodedAmount)

      expect(await vaultContract.accounts(manager.address)).to.be.deep.equal([ethers.toBigInt(1)])
    })

    it('should create a position', async function () {
      const { vaultContract, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const vaultContractAddress = await vaultContract.getAddress()

      const manager = accounts[0]
      const encodedAmount = [100]
      await tokenContract.approve(vaultContractAddress, 100)
      await vaultContract.deposit(manager, encodedAmount)

      expect(await vaultContract.positions(1)).to.be.deep.equal([encodedAmount])
    })

    it('should revert if try to add position without being the owner', async function () {
      const { vaultContract, accounts, tokenContract } = await loadFixture(vault.deployVaultFixture)
      const [_, notOwner] = accounts

      const vaultContractAddress = await vaultContract.getAddress()
      const encodedAmount = [100]
      await tokenContract.approve(vaultContractAddress, 100)

      const notOwnerVault = vaultContract.connect(notOwner) as any

      await expect(notOwnerVault.deposit(notOwner, encodedAmount)).to.be.rejectedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
