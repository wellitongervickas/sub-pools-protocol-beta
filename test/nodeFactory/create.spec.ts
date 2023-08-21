import { expect } from 'chai'
import { loadFixture, nodeFactory, token, vault } from '../fixtures'

describe('NodeFactory', () => {
  describe('Create', () => {
    it('should emit NodeFactory_Created on create', async function () {
      const { vaultAddress } = await loadFixture(vault.deployVaultFixture)
      const { nodeFactoryContract } = await loadFixture(nodeFactory.deployNodeFactoryFixture)

      await expect(nodeFactoryContract.createNode([vaultAddress], [vaultAddress])).to.emit(
        nodeFactoryContract,
        'NodeFactory_Created'
      )
    })
  })
})
