import { expect } from 'chai'
import { ethers, loadFixture, vault } from '../../fixtures'
import coderUtils from '../../helpers/coder'
import { FAKE_PARENT } from '../../helpers/address'

describe('Vault', () => {
  describe('Position', () => {
    it('should emit Vault_PositionAdded on add position', async function () {
      const { vaultContract, tokenContract, fakeStrategyAddress } = await loadFixture(vault.deployVaultFixture)
      const vaultContractAddress = await vaultContract.getAddress()
      const encodedAmount = coderUtils.build([[100]], ['uint256[]'])
      await tokenContract.approve(vaultContractAddress, 100)

      await expect(vaultContract.addPosition(encodedAmount, FAKE_PARENT))
        .to.emit(vaultContract, 'Vault_PositionAdded')
        .withArgs(1, encodedAmount)
    })

    it('should create an account', async function () {
      const { vaultContract, accounts, tokenContract, fakeStrategyAddress } = await loadFixture(
        vault.deployVaultFixture
      )
      const [manager] = accounts

      const vaultContractAddress = await vaultContract.getAddress()
      const encodedAmount = coderUtils.build([[100]], ['uint256[]'])
      await tokenContract.approve(vaultContractAddress, 100)

      await vaultContract.addPosition(encodedAmount, FAKE_PARENT)

      expect(await vaultContract.accounts(manager.address)).to.be.deep.equal([ethers.toBigInt(1), FAKE_PARENT])
    })

    it('should create a position', async function () {
      const { vaultContract, tokenContract, fakeStrategyAddress } = await loadFixture(vault.deployVaultFixture)
      const vaultContractAddress = await vaultContract.getAddress()
      const encodedAmount = coderUtils.build([[100]], ['uint256[]'])
      await tokenContract.approve(vaultContractAddress, 100)
      await vaultContract.addPosition(encodedAmount, FAKE_PARENT)

      expect(await vaultContract.positions(1)).to.be.deep.equal([encodedAmount])
    })

    it('should revert if try to add position without being the owner', async function () {
      const { vaultContract, accounts, tokenContract } = await loadFixture(vault.deployVaultFixture)
      const [_, notOwner] = accounts

      const vaultContractAddress = await vaultContract.getAddress()
      const encodedAmount = coderUtils.build([[100]], ['uint256[]'])
      await tokenContract.approve(vaultContractAddress, 100)

      const notOwnerVault = vaultContract.connect(notOwner) as any

      await expect(notOwnerVault.addPosition(encodedAmount, FAKE_PARENT)).to.be.rejectedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
