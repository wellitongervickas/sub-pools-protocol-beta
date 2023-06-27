import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Withdraw Balance', () => {
    it('should update main subpool balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address], 0)
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      await subPoolRouter.additionalDeposit(subPoolAddress, additionalAmount)
      await subPoolRouter.withdrawBalance(subPoolAddress, additionalAmount)

      const [, , , balance] = await subPoolRouter.subPools(subPoolAddress)
      expect(balance).to.deep.equal(0)
    })
  })

  describe('Withdraw Initial Balance', () => {
    it('should update main subpool initial balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address], 0)
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      await subPoolRouter.withdrawInitialBalance(subPoolAddress, amount)

      const [, , initialBalance] = await subPoolRouter.subPools(subPoolAddress)
      expect(initialBalance).to.deep.equal(0)
    })
  })
})
