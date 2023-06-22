import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers, SubPoolRouter } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Join', () => {
    it('should join a parent subpool as node', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = '1000'
      const [, invited] = accounts

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter

      await expect(invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])).to.not.be.reverted
    })

    it('should set parent subpool when joined', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = '1000'
      const [, invited] = accounts

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx2 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx2.wait()
      const [subPoolAddress2] = receipt2.logs[6].args
      const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress2)
      const parentAddress = await subPoolNode.parent()

      expect(parentAddress).to.equal(subPoolAddress)
    })
  })
})
