import { expect } from 'chai'
import { loadFixture, adapterVault } from '../../fixtures'
import { DEFAULT_SUPPLY } from '../../fixtures/token'

describe('AdapterVault', () => {
  describe('Deposit', () => {
    it('should set shares to receiver on deposit', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()
      const [, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      await adapterVaultContract.deposit(amount, receiver.address)

      expect(await adapterVaultContract.balanceOf(receiver.address)).to.equal(DEFAULT_SUPPLY)
    })

    it('should transfer assets to receiver when withdraw', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()
      const [owner, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      await adapterVaultContract.deposit(amount, owner.address)
      await adapterVaultContract.withdraw(amount, receiver.address, owner.address)

      expect(await adapterVaultContract.balanceOf(receiver.address)).to.equal(0)
    })

    it('should send tokens back to the owner when withdraw', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()
      const [owner] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      await adapterVaultContract.deposit(amount, owner.address)
      await adapterVaultContract.withdraw(amount, owner.address, owner.address)

      expect(await tokenContract.balanceOf(owner.address)).to.equal(DEFAULT_SUPPLY)
    })

    it('should revert if try to deposit without being the owner', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()

      const [, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      const receiverAdapterVaultContract = adapterVaultContract.connect(receiver) as any

      await expect(receiverAdapterVaultContract.deposit(amount, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if try to withdraw without being the owner', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()

      const [owner, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      const receiverAdapterVaultContract = adapterVaultContract.connect(receiver) as any

      await expect(receiverAdapterVaultContract.withdraw(amount, receiver.address, owner.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
