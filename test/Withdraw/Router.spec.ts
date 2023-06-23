import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Withdraw', () => {
    it.skip('should update main subpool balance on withdraw', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)

      const amount = ethers.toBigInt(10000)
      const amountToRemove = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[2].args

      await subPoolRouter.withdrawFunds(subPoolAddress, amountToRemove)

      const [, , , balance] = await subPoolRouter.subPools(subPoolAddress)

      expect(balance).to.deep.equal(amount - amountToRemove)
    })
  })
})
