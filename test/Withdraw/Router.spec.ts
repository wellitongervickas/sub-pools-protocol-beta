import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Withdraw Funds', () => {
    it('should update main subpool balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(10000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      await subPoolRouter.additionalDeposit(subPoolAddress, additionalAmount)
      await subPoolRouter.withdrawFunds(subPoolAddress, additionalAmount)

      const [, , , balance] = await subPoolRouter.subPools(subPoolAddress)
      expect(balance).to.deep.equal(0)
    })
  })
})
