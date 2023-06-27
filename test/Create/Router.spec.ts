import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Create', () => {
    it('should update next ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      await subPoolRouter.create(100, DEFAULT_FEES_FRACTION, [])

      expect(await subPoolRouter.currentID()).to.equal(1)
    })

    it('should set the main subpool initial balance', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)

      const amount = ethers.toBigInt(1000)
      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[2].args
      const [, , initialBalance] = await subPoolRouter.subPools(subPoolAddress)

      expect(initialBalance).to.deep.equal(ethers.toBigInt(amount))
    })

    it('should set the parent of main node as router itself', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
      const receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[2].args

      const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)
      const parent = await subPoolNode.parent()

      expect(await subPoolRouter.getAddress()).to.equal(parent)
    })
  })
})
