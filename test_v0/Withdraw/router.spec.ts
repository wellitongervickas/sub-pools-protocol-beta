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
  describe('Withdraw Balance', () => {
    it('should update main subpool balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      await subPoolRouter.additionalDeposit(subPoolAddress, additionalAmount)
      await subPoolRouter.withdrawBalance(subPoolAddress, additionalAmount)

      const [, , , balance] = await subPoolRouter.children(subPoolAddress)
      expect(balance).to.deep.equal(0)
    })
  })

  describe('Withdraw Initial Balance', () => {
    it('should update main subpool initial balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      await subPoolRouter.withdrawInitialBalance(subPoolAddress, amount)

      const [, , initialBalance] = await subPoolRouter.children(subPoolAddress)
      expect(initialBalance).to.deep.equal(0)
    })
  })
})
