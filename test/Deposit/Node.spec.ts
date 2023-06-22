import { expect } from 'chai'
import { deployRoutedNodeFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

describe('SubPoolNode', () => {
  describe('Additional deposit', () => {
    it('should update manager balance on additional deposit', async function () {
      const amount = ethers.toBigInt(100)
      const [, invited, node1] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node1.address])
      const rcpt0 = await tx0.wait()
      const invitedSubPoolNodeAddress = rcpt0.logs[7].args[0]

      const node1RouterInstance = subPoolRouter.connect(node1) as any
      const tx1 = await node1RouterInstance.join(invitedSubPoolNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const node1SubPoolNodeAddress = rcpt1.logs[7].args[0]

      const newAmount = ethers.toBigInt(1000)
      await node1RouterInstance.additionalDeposit(node1SubPoolNodeAddress, newAmount)

      const subPoolNode1 = await ethers.getContractAt('SubPoolNode', node1SubPoolNodeAddress)
      const [, , balance] = await subPoolNode1.manager()
      expect(balance).to.be.deep.equal(newAmount)
    })

    it('should update parent balance when manager additional deposit', async function () {
      const amount = ethers.toBigInt(100)
      const [, invited, node1] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node1.address])
      const rcpt0 = await tx0.wait()
      const invitedSubPoolNodeAddress = rcpt0.logs[7].args[0]

      const node1RouterInstance = subPoolRouter.connect(node1) as any
      const tx1 = await node1RouterInstance.join(invitedSubPoolNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const node1SubPoolNodeAddress = rcpt1.logs[7].args[0]

      const newAmount = ethers.toBigInt(1000)
      await node1RouterInstance.additionalDeposit(node1SubPoolNodeAddress, newAmount)

      const subPoolInvited = await ethers.getContractAt('SubPoolNode', invitedSubPoolNodeAddress)
      const [, , , balance] = await subPoolInvited.subPools(node1SubPoolNodeAddress)
      expect(balance).to.be.deep.equal(newAmount)
    })
  })
})
