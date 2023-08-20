import { expect } from 'chai'
import { loadFixture, node } from '../fixtures'

describe('Node', () => {
  describe('Position', () => {
    describe('Create', () => {
      it('should emit Node_PositionCreated ', async function () {
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
          .withArgs([amount], depositor.address)
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

    describe('Decrease', () => {
      it('should emit Node_PositionRemoved', async function () {
        const amount = '1000000000000000000'

        const { nodeContract, accounts, tokenContract, vaultContract, vaultAddress, nodeAddress } = await loadFixture(
          node.deployNodeFixture
        )

        const [depositor] = accounts

        await tokenContract.approve(vaultAddress, amount)
        await vaultContract.deposit(amount, depositor)
        await vaultContract.approve(nodeAddress, amount)

        await nodeContract.createPosition([amount], depositor)

        await expect(nodeContract.decreasePosition([amount], depositor))
          .to.emit(nodeContract, 'Node_PositionRemoved')
          .withArgs([amount], depositor.address)
      })

      it('should balance on position', async function () {
        const amount = '1000000000000000000'

        const { nodeContract, accounts, tokenContract, vaultContract, vaultAddress, nodeAddress } = await loadFixture(
          node.deployNodeFixture
        )

        const [depositor] = accounts

        await tokenContract.approve(vaultAddress, amount)
        await vaultContract.deposit(amount, depositor)
        await vaultContract.approve(nodeAddress, amount)

        await nodeContract.createPosition([amount], depositor)
        await nodeContract.decreasePosition([amount], depositor)

        const [, [positionBalance]] = await nodeContract.position(depositor.address)

        expect(positionBalance).to.equal(0)
      })

      it('should receive shares from vault', async function () {
        const amount = '1000000000000000000'

        const { nodeContract, accounts, tokenContract, vaultContract, vaultAddress, nodeAddress } = await loadFixture(
          node.deployNodeFixture
        )

        const [depositor] = accounts

        await tokenContract.approve(vaultAddress, amount)
        await vaultContract.deposit(amount, depositor)
        await vaultContract.approve(nodeAddress, amount)

        await nodeContract.createPosition([amount], depositor)
        await nodeContract.decreasePosition([amount], depositor)

        const depositorBalance = await vaultContract.balanceOf(depositor.address)
        expect(depositorBalance).to.equal(amount)
      })
    })
  })
})
