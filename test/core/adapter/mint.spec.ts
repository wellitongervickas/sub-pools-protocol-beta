import { expect } from 'chai'
import { loadFixture, adapterVault } from '../../fixtures'
import { DEFAULT_SUPPLY } from '../../fixtures/token'

describe('AdapterVault', () => {
  describe('Mint', () => {
    it('should not update shares to receiver on mint', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()
      const [owner] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      await adapterVaultContract.mint(amount, owner.address)

      expect(await adapterVaultContract.balanceOf(owner.address)).to.equal(0)
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

      await expect(receiverAdapterVaultContract.mint(amount, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
