import { expect } from 'chai'
import { loadFixture, node } from '../fixtures'

describe('Node', () => {
  describe('Position', () => {
    describe('Create', () => {
      it('should emit Node_PositionCreated on create position', async function () {
        const amount = '1000000000000000000'

        const { nodeContract, accounts, tokenContract, vaultContract, vaultAddress, nodeAddress } = await loadFixture(
          node.deployNodeFixture
        )

        const [depositor] = accounts

        await tokenContract.approve(vaultAddress, amount)
        await vaultContract.deposit(amount, depositor)
        await vaultContract.approve(nodeAddress, amount)

        await expect(nodeContract.createPosition([amount], depositor))
          .to.emit(nodeContract, 'Node_PositionCreated')
          .withArgs(1, depositor.address, [amount])
      })

      it('should receive assets from vault', async function () {
        const amount = '1000000000000000000'

        const { nodeContract, accounts, tokenContract, vaultContract, vaultAddress, nodeAddress } = await loadFixture(
          node.deployNodeFixture
        )

        const [depositor] = accounts

        await tokenContract.approve(vaultAddress, amount)
        await vaultContract.deposit(amount, depositor)
        await vaultContract.approve(nodeAddress, amount)

        await nodeContract.createPosition([amount], depositor)

        const nodeAssetsBalance = await tokenContract.balanceOf(nodeAddress)
        expect(nodeAssetsBalance).to.equal(amount)
      })
    })
  })
})
