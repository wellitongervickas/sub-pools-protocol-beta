import { expect } from 'chai'
import { loadFixture, node } from '../fixtures'

describe('Node', () => {
  describe('Deploy', () => {
    it('should set owner as deployer', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const owner = await nodeContract.owner()
      expect(owner).to.equal(accounts[0].address)
    })

    it('should set vaults on deploy', async function () {
      const { nodeContract, vaultAddress } = await loadFixture(node.deployNodeFixture)
      const vault = await nodeContract.vault(0)

      expect(vault).to.equal(vaultAddress)
    })
  })
})
