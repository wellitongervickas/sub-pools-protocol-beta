import { expect } from 'chai'
import { loadFixture, node } from '../../fixtures'

describe('Node', () => {
  describe('Join', () => {
    it('should join as node', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], false))
      const [, nodeTest] = accounts

      await nodeContract.join(nodeTest.address, nodeTest.address)

      expect(await nodeContract.hasNodeRole(nodeTest.address)).to.be.true
    })

    it('should emit Node_Joined event', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], false))
      const [, nodeTest] = accounts

      await expect(nodeContract.join(nodeTest.address, nodeTest.address))
        .to.emit(nodeContract, 'Node_Joined')
        .withArgs(nodeTest.address, nodeTest.address)
    })

    it('should revert if try to join as node without being the router', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], false))
      const [, notRouter] = accounts
      const notRouterNodeContract = nodeContract.connect(notRouter) as any

      await expect(notRouterNodeContract.join(notRouter.address, notRouter.address)).to.be.rejectedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if try to join as node when invited only', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, nodeTest] = accounts

      await expect(nodeContract.join(nodeTest.address, nodeTest.address)).to.be.revertedWithCustomError(
        nodeContract,
        'Node_NotInvited()'
      )
    })

    it('should revert if try to join twice as node when not invited only', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], false))
      const [, nodeTest] = accounts

      await nodeContract.join(nodeTest.address, nodeTest.address)

      await expect(nodeContract.join(nodeTest.address, nodeTest.address)).to.be.revertedWithCustomError(
        nodeContract,
        'NodeManager_AlreadyNode()'
      )
    })
  })
})
