import { expect } from 'chai'
import { ethers, loadFixture, vault, token } from '../../fixtures'
import { createRandomAddress } from '../../helpers/address'

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

    it('should transfer tokens to vault the amount of tokens', async function () {
      const { vaultContract, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)

      const vaultContractAddress = await vaultContract.getAddress()
      const manager = accounts[0]
      const encodedAmount = [100]

      await tokenContract.approve(vaultContractAddress, 100)

      await vaultContract.deposit(manager, encodedAmount)

      expect(await tokenContract.balanceOf(vaultContractAddress)).to.be.equal(100)
    })

    it('should revert if try to deposit to a non-valid adapter', async function () {
      const { tokenContract, accounts } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const InvalidStrategy = await ethers.getContractFactory('InvalidStrategy')
      const invalidStrategyContract = await InvalidStrategy.deploy([tokenAddress])
      const invalidStrategyAddress = await invalidStrategyContract.getAddress()

      const Vault = await ethers.getContractFactory('Vault')
      const vaultContract = await Vault.deploy(invalidStrategyAddress)

      const vaultContractAddress = await vaultContract.getAddress()
      const manager = accounts[0]
      const encodedAmount = [100]

      await tokenContract.approve(vaultContractAddress, 100)
      await expect(vaultContract.deposit(manager, encodedAmount)).to.be.revertedWithCustomError(
        vaultContract,
        'VaultAdapter_DepositFailed()'
      )
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
