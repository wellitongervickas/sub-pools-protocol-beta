import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Withdraw Funds', () => {
    it('should update manager balance on withdraw funds', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(10000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx1.wait()
      const [invitedSubPoolAddress] = receipt2.logs[5].args

      // increase amount of balance since initial balance is cashback locked period
      await invitedRouterInstance.additionalDeposit(invitedSubPoolAddress, additionalAmount)
      const invitedSubPoolNodeContract = await ethers.getContractAt('SubPoolNode', invitedSubPoolAddress)
      await invitedRouterInstance.withdrawFunds(invitedSubPoolAddress, additionalAmount)

      const [, , balance] = await invitedSubPoolNodeContract.manager()
      expect(balance).to.deep.equal(0)
    })

    it('should update parent balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(10000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx1.wait()
      const [invitedSubPoolAddress] = receipt2.logs[5].args

      // increase amount of balance since initial balance is cashback locked period
      await invitedRouterInstance.additionalDeposit(invitedSubPoolAddress, additionalAmount)
      const subPoolNodeContract = await ethers.getContractAt('SubPoolNode', subPoolAddress)
      await invitedRouterInstance.withdrawFunds(invitedSubPoolAddress, additionalAmount)

      const [, , , balance] = await subPoolNodeContract.subPools(invitedSubPoolAddress)
      expect(balance).to.deep.equal(0)
    })
  })
})
