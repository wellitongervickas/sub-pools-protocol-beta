import { expect } from 'chai'
import {
  loadFixture,
  DEFAULT_FEES_FRACTION,
  ethers,
  Router,
  deployRoutedNodeFixture,
  NODE_ROLE,
  DEFAULT_PERIOD_LOCK,
  DEFAULT_REQUIRED_INITIAL_AMOUNT,
  DEFAULT_MAX_ADDITIONAL_AMOUNT,
} from '../fixtures'

describe('Children', () => {
  describe('Join', () => {
    it('should set initial balance', async function () {
      const amount = ethers.toBigInt(100)
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [node.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[6].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(
        invitedSubNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[5].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('Children', invitedSubNodeAddress)
      const [, , initialBalance] = await invitedSubPoolNode.children(nodeAddress)
      expect(initialBalance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should set balance', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [node.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[6].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(
        invitedSubNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[5].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('Children', invitedSubNodeAddress)
      const [, , , balance] = await invitedSubPoolNode.children(nodeAddress)
      expect(balance).to.be.equal(ethers.toBigInt(0))
    })

    it('should update from invite to node role', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(other) as Router
      await subPoolRouterInstance.join(
        subNodeAddress,
        0,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      expect(await subPoolNode.hasRole(NODE_ROLE, other.address)).to.be.true
    })

    it('should update parent balance', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [node.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      const [, , , balance] = await subPoolRouter.children(subNodeAddress)
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
      const tx0 = await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        customFeesFraction,
        [node.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[6].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      await nodeRouterInstance.join(
        invitedSubNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const invitedSubPoolNode = await ethers.getContractAt('Children', invitedSubNodeAddress)

      const [, , balance] = await invitedSubPoolNode.manager()
      expect(balance).to.be.equal('500000000000000000')
    })

    it('should set node balance when manager ratio is set', async function () {
      const customFeesFraction = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(100),
      }

      const amount = ethers.parseUnits('100', 18)

      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        customFeesFraction,
        [node.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[6].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(
        invitedSubNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[5].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('Children', invitedSubNodeAddress)

      const [, , initialBalance] = await invitedSubPoolNode.children(nodeAddress)
      expect(initialBalance).to.be.equal('99000000000000000000')
    })
  })
})
