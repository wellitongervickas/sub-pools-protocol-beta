import { expect } from 'chai'
import { deployNodeFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers } from '../fixtures'

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
  })
})
