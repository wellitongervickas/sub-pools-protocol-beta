import { expect } from 'chai'
import { loadFixture, adapterVault } from '../../fixtures'
import { DEFAULT_SUPPLY } from '../../fixtures/token'

describe('AdapterVault', () => {
  describe('Deposit', () => {
    it('should not update shares from receiver when withdraw', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()
      const [owner, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      const receiverAdapterVaultContract = adapterVaultContract.connect(receiver) as any

      await adapterVaultContract.deposit(amount, receiver.address)
      await receiverAdapterVaultContract.increaseAllowance(owner.address, amount)
      await adapterVaultContract.redeem(amount, owner.address, receiver.address)

      expect(await adapterVaultContract.balanceOf(receiver.address)).to.equal(DEFAULT_SUPPLY)
    })

    it('should not transfer assets back to the receiver when redeem', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()
      const [owner] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      await adapterVaultContract.deposit(amount, owner.address)
      await adapterVaultContract.redeem(amount, owner.address, owner.address)

      expect(await tokenContract.balanceOf(owner.address)).to.equal(0)
    })

    it('should revert if try to redeem without being the owner', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()

      const [owner, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      const receiverAdapterVaultContract = adapterVaultContract.connect(receiver) as any

      await expect(receiverAdapterVaultContract.redeem(amount, receiver.address, owner.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
