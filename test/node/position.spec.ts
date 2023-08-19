import { expect } from 'chai'
import { loadFixture, node } from '../fixtures'

describe('Node', () => {
  describe('Position', () => {
    describe('Create', () => {
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

      it('should revert if try to call createPosition without being the owner', async function () {
        const amount = '1000000000000000000'

        const { nodeContract, accounts, tokenContract, vaultContract, vaultAddress, nodeAddress } = await loadFixture(
          node.deployNodeFixture
        )

        const [depositor, hacker] = accounts

        await tokenContract.approve(vaultAddress, amount)
        await vaultContract.deposit(amount, depositor)
        await vaultContract.approve(nodeAddress, amount)

        const hackerNodeContract = nodeContract.connect(hacker) as any

        await expect(hackerNodeContract.createPosition([amount], depositor)).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })
    })
  })
})
