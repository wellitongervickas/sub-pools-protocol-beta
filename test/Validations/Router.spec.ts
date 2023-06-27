import { expect } from 'chai'
import { deployRoutedNodeFixture, loadFixture, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Validations', () => {
    describe('Additional deposit', () => {
      it('should revert if try to call additional deposit without being the manager', async function () {
        const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
        const [, anyEntity] = accounts
        const nodeAddress = await subPoolNode.getAddress()
        const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

        await expect(
          anyEntityRouterInstance.additionalDeposit(nodeAddress, ethers.toBigInt(100))
        ).to.be.revertedWithCustomError(subPoolRouter, 'NotNodeManager()')
      })
    })

    describe('Withdraw Balance', () => {
      it('should revert if try to call withdraw balance without being the manager', async function () {
        const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
        const [, anyEntity] = accounts
        const nodeAddress = await subPoolNode.getAddress()
        const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

        await expect(
          anyEntityRouterInstance.withdrawBalance(nodeAddress, ethers.toBigInt(100))
        ).to.be.revertedWithCustomError(subPoolRouter, 'NotNodeManager()')
      })

      it('should revert if try to call withdraw initial balance without being the manager', async function () {
        const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
        const [, anyEntity] = accounts
        const nodeAddress = await subPoolNode.getAddress()
        const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

        await expect(
          anyEntityRouterInstance.withdrawInitialBalance(nodeAddress, ethers.toBigInt(100))
        ).to.be.revertedWithCustomError(subPoolRouter, 'NotNodeManager()')
      })
    })
  })
})
