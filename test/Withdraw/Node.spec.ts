import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers, getArgs } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Withdraw', () => {
    it('should update manager balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx1.wait()
      const [invitedSubPoolAddress] = receipt2.logs[5].args

      await invitedRouterInstance.additionalDeposit(invitedSubPoolAddress, additionalAmount)
      await invitedRouterInstance.withdrawBalance(invitedSubPoolAddress, additionalAmount)

      const invitedSubPoolNodeContract = await ethers.getContractAt('SubPoolNode', invitedSubPoolAddress)
      const [, , balance] = await invitedSubPoolNodeContract.manager()
      expect(balance).to.deep.equal(0)
    })

    it('should update parent balance on withdraw', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx1.wait()
      const [invitedSubPoolAddress] = receipt2.logs[5].args

      await invitedRouterInstance.additionalDeposit(invitedSubPoolAddress, additionalAmount)
      await invitedRouterInstance.withdrawBalance(invitedSubPoolAddress, additionalAmount)

      const subPoolNodeContract = await ethers.getContractAt('SubPoolNode', subPoolAddress)
      const [, , , balance] = await subPoolNodeContract.subPools(invitedSubPoolAddress)
      expect(balance).to.deep.equal(0)
    })

    it('should update manager initial balance on withdraw cashback', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx1.wait()
      const [invitedSubPoolAddress] = receipt2.logs[5].args

      await invitedRouterInstance.withdrawInitialBalance(invitedSubPoolAddress, amount)
      const invitedSubPoolNodeContract = await ethers.getContractAt('SubPoolNode', invitedSubPoolAddress)

      const [, initialBalance] = await invitedSubPoolNodeContract.manager()
      expect(initialBalance).to.deep.equal(0)
    })

    it('should update parent balance on withdraw cashback', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx1.wait()

      const [invitedSubPoolAddress] = receipt2.logs[5].args

      await invitedRouterInstance.withdrawInitialBalance(invitedSubPoolAddress, amount)

      const subPoolNodeContract = await ethers.getContractAt('SubPoolNode', subPoolAddress)
      const [, , balance] = await subPoolNodeContract.subPools(invitedSubPoolAddress)
      expect(balance).to.deep.equal(0)
    })
  })
})
