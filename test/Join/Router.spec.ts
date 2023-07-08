import { expect } from 'chai'
import {
  deployRouterFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  ethers,
  Router,
  DEFAULT_PERIOD_LOCK,
  DEFAULT_REQUIRED_INITIAL_AMOUNT,
  DEFAULT_MAX_ADDITIONAL_AMOUNT,
} from '../fixtures'

describe('Router', () => {
  describe('Join', () => {
    it('should join a parent subpool as node', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = ethers.toBigInt(1000)
      const [, invited] = accounts

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

      const invitedRouterInstance = subPoolRouter.connect(invited) as Router

      await expect(
        invitedRouterInstance.join(
          subPoolAddress,
          amount,
          DEFAULT_FEES_FRACTION,
          [],
          DEFAULT_PERIOD_LOCK,
          DEFAULT_REQUIRED_INITIAL_AMOUNT,
          DEFAULT_MAX_ADDITIONAL_AMOUNT
        )
      ).to.not.be.reverted
    })

    it('should set parent subpool when joined', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = ethers.toBigInt(1000)
      const [, invited] = accounts

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

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx2 = await invitedRouterInstance.join(
        subPoolAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt2 = await tx2.wait()
      const [subPoolAddress2] = receipt2.logs[5].args
      const subPoolNode = await ethers.getContractAt('Children', subPoolAddress2)
      const parentAddress = await subPoolNode.parent()

      expect(parentAddress).to.equal(subPoolAddress)
    })
  })
})
