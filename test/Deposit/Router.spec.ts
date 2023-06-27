import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Additional deposit', () => {
    it('should update main subpool balance on additional deposit', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[2].args

      await subPoolRouter.additionalDeposit(subPoolAddress, amount)

      const [, , , balance] = await subPoolRouter.subPools(subPoolAddress)
      expect(balance).to.deep.equal(amount)
    })
  })
})
