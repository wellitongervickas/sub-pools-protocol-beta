import { expect } from 'chai'
import {
  loadFixture,
  DEFAULT_FEES_FRACTION,
  ethers,
  SubPoolRouter,
  deployRoutedNodeFixture,
  NODE_ROLE,
} from '../fixtures'

describe('SubPoolNode', () => {
  describe('Join', () => {
    it('should update the ID', async function () {
      const [, invited] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter
      await subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, [])

      expect(await subPoolNode.currentID()).to.equal(1)
    })

    it('should set initial balance', async function () {
      const amount = ethers.toBigInt(100)
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[7].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)
      const [, , initialBalance] = await invitedSubPoolNode.subPools(nodeAddress)
      expect(initialBalance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should set balance', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[7].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)
      const [, , , balance] = await invitedSubPoolNode.subPools(nodeAddress)
      expect(balance).to.be.equal(ethers.toBigInt(0))
    })

    it('should update from invite to node role', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(other) as SubPoolRouter
      await subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, [])

      expect(await subPoolNode.hasRole(NODE_ROLE, other.address)).to.be.true
    })

    it('should update parent balance', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])

      const [, , , balance] = await subPoolRouter.subPools(subNodeAddress)
      expect(balance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should set manager balance when manager ratio is set', async function () {
      const customFeesFraction = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      } // 100e18 * (1/200 = 0.005) = 0.5e18

      const amount = ethers.parseUnits('100', 18)

      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, customFeesFraction, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)

      const [, , balance] = await invitedSubPoolNode.manager()
      expect(balance).to.be.equal('500000000000000000')
    })

    it('should set node balance when manager ratio is set', async function () {
      const customFeesFraction = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(100),
      } // 10%

      const amount = ethers.parseUnits('100', 18)

      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, customFeesFraction, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[7].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)

      const [, , initialBalance] = await invitedSubPoolNode.subPools(nodeAddress)
      expect(initialBalance).to.be.equal('99000000000000000000')
    })
  })
})
