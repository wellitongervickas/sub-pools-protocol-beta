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
  describe('Create', () => {
    it('should update next ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      await subPoolRouter.create(
        100,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      expect(await subPoolRouter.currentID()).to.equal(1)
    })

    it('should set the main subpool initial balance', async function () {
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
      const [, , initialBalance] = await subPoolRouter.children(subPoolAddress)

      expect(initialBalance).to.deep.equal(ethers.toBigInt(amount))
    })

    it('should set the parent of main node as router itself', async function () {
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
      const receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[2].args

      const subPoolNode = await ethers.getContractAt('Children', subPoolAddress)
      const parent = await subPoolNode.parent()

      expect(await subPoolRouter.getAddress()).to.equal(parent)
    })
  })
})
