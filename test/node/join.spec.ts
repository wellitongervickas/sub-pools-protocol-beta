import { expect } from 'chai'
import { node, loadFixture } from '../fixtures'

describe('Node', () => {
  describe('Join', () => {
    it('should set node manager on join', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const { nodeContract: nodeContract2 } = await loadFixture(node.deployNodeFixture)
      const [, otherManager] = accounts

      const node2Address = await nodeContract2.getAddress()
      await nodeContract.join(node2Address, otherManager.address)

      const [nodeManager] = await nodeContract.node(node2Address)
      expect(nodeManager).to.equal(otherManager.address)
    })

    it('should revert if try to join invited only node', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], true))

      const { nodeContract: nodeContract2 } = await loadFixture(node.deployNodeFixture.bind(this, [], true))

      const [, otherManager] = accounts

      const node2Address = await nodeContract2.getAddress()

      await expect(nodeContract.join(node2Address, otherManager.address)).to.be.revertedWithCustomError(
        nodeContract,
        'NotInvited()'
      )
    })

    it('should revert if try to join already node', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const { nodeContract: nodeContract2 } = await loadFixture(node.deployNodeFixture)
      const [, otherManager] = accounts

      const node2Address = await nodeContract2.getAddress()
      await nodeContract.join(node2Address, otherManager.address)

      await expect(nodeContract.join(node2Address, otherManager.address)).to.be.revertedWithCustomError(
        nodeContract,
        'AlreadyNode()'
      )
    })
  })
})
