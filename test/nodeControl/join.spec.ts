import { expect } from 'chai'
import { nodeControl, loadFixture } from '../fixtures'

describe('Node', () => {
  describe('Join', () => {
    it('should set node manager on join', async function () {
      const { nodeControlContract, accounts } = await loadFixture(nodeControl.deployNodeControlFixture)
      const { nodeControlContract: nodeControlContract2 } = await loadFixture(nodeControl.deployNodeControlFixture)
      const [, otherManager] = accounts

      const node2Address = await nodeControlContract2.getAddress()
      await nodeControlContract.join(node2Address, otherManager.address)

      const [nodeManager] = await nodeControlContract.node(node2Address)
      expect(nodeManager).to.equal(otherManager.address)
    })
  })
})
