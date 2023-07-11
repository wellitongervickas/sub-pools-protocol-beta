import { expect } from 'chai'
import {
  deployRouterFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  ethers,
  DEFAULT_PERIOD_LOCK,
  DEFAULT_REQUIRED_INITIAL_AMOUNT,
  DEFAULT_MAX_ADDITIONAL_AMOUNT,
} from '../fixtures'

describe('Router', () => {
  describe('Additional deposit', () => {
    it('should update main subpool balance on additional deposit', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[2].args

      await subPoolRouter.additionalDeposit(subPoolAddress, amount)

      const [, , , balance] = await subPoolRouter.children(subPoolAddress)
      expect(balance).to.deep.equal(amount)
    })
  })
})
