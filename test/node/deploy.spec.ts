import { expect } from 'chai'
import { loadFixture, node } from '../fixtures'

describe('Node', () => {
  describe('Deploy', () => {
    it('should set vaults on deploy', async function () {
      const { nodeContract, vaultAddress } = await loadFixture(node.deployNodeFixture)
      const vault = await nodeContract.vaultIn(0)

      expect(vault).to.equal(vaultAddress)
    })
  })
})
