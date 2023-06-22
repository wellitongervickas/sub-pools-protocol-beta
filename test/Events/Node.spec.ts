import { expect } from 'chai'
import {
  deployNodeFixture,
  deployRoutedNodeFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  ethers,
  SubPoolRouter,
  anyValue,
} from '../fixtures'

describe('SubPoolNode', () => {
  describe('Events', () => {
    describe('Invite', () => {
      it('should emit NodeManagerInvited event when invite a new node manager', async function () {
        const [manager, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        await expect(subPoolNode.invite(invited.address))
          .to.emit(subPoolNode, 'NodeManagerInvited')
          .withArgs(invited.address)
      })
    })

    describe('Join', () => {
      it('should emit NodeManagerJoined event when node manager join', async function () {
        const [, invited] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const subPoolRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(await subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolNode, 'NodeManagerJoined')
          .withArgs(invited.address, anyValue)
      })

      it('should emit SubPoolDeposited event when node join', async function () {
        const amount = 100
        const [, invited, node] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
        const subNodeAddress = await subPoolNode.getAddress()

        const invitedRouterInstance = subPoolRouter.connect(invited) as any
        const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])
        const rcpt0 = await tx0.wait()
        const invitedSubNodeAddress = rcpt0.logs[7].args[0]

        const nodeRouterInstance = subPoolRouter.connect(node) as any

        await expect(nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolNode, 'SubPoolDeposited')
          .withArgs(invitedSubNodeAddress, anyValue)
      })
    })
  })
})
