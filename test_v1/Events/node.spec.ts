import { expect } from 'chai'
import { deployNodeFixture, loadFixture, ethers } from '../fixtures'

describe('Children', () => {
  describe('Invite', () => {
    it('should emit NodeManagerInvited event when invite a new node manager', async function () {
      const [, , invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await expect(subPoolNode.invite(invited.address))
        .to.emit(subPoolNode, 'NodeManagerInvited')
        .withArgs(invited.address)
    })
  })
})
