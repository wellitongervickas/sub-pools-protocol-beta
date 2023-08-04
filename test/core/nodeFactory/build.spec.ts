import { expect } from 'chai'
import { anyValue, ethers, loadFixture, nodeFactory } from '../../fixtures'
import { FAKE_PARENT, FAKE_REGISTRY } from '../../helpers/address'

describe('NodeFactory', () => {
  describe('Build', () => {
    it('should emit NodeFactory_NodeCreated when build', async function () {
      const { nodeFactoryContract, accounts } = await loadFixture(nodeFactory.deployNodeFactoryFixture)

      const [manager] = accounts

      await expect(nodeFactoryContract.build(manager.address, [], FAKE_PARENT, FAKE_REGISTRY))
        .to.emit(nodeFactoryContract, 'NodeFactory_NodeCreated')
        .withArgs(anyValue, [], FAKE_PARENT, FAKE_REGISTRY)
    })

    it("should set the node's manager as the sender", async function () {
      const { nodeFactoryContract, accounts } = await loadFixture(nodeFactory.deployNodeFactoryFixture)

      const [manager] = accounts

      const tx = await nodeFactoryContract.build(manager.address, [], FAKE_PARENT, FAKE_REGISTRY)
      const receipt = await tx.wait()

      const nodeContract = await ethers.getContractAt('Node', receipt.logs[3].args[0])

      expect(await nodeContract.owner()).to.equal(manager.address)
    })
  })
})
