import { expect } from 'chai'
import {
  deployNodeFixture,
  deployRoutedNodeFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  MANAGER_ROLE,
  ethers,
  SubPoolRouter,
  SubPoolNode,
} from '../fixtures'

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

    describe('Withdraw funds', () => {
      it('should revert if try to call withdraw funds without being the manager', async function () {
        const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
        const [, anyEntity] = accounts
        const nodeAddress = await subPoolNode.getAddress()
        const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

        await expect(
          anyEntityRouterInstance.withdrawFunds(nodeAddress, ethers.toBigInt(100))
        ).to.be.revertedWithCustomError(subPoolRouter, 'NotNodeManager()')
      })
    })
  })
})
