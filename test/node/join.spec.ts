import { expect } from 'chai'
import { node, loadFixture } from '../fixtures'

describe('Node', () => {
  describe('Join', () => {
    it('should setup node manager on create', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts

      const nodeManager = await nodeContract.manager()

      expect(nodeManager).to.equal(manager.address)
    })

    it('should set node manager on join', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const { nodeContract: nodeContract2 } = await loadFixture(node.deployNodeFixture)
      const [, otherManager] = accounts

      const node2Address = await nodeContract2.getAddress()
      await nodeContract.join(node2Address, otherManager.address)

      const [nodeManager] = await nodeContract.node(node2Address)
      expect(nodeManager).to.equal(otherManager.address)
    })
  })
})
