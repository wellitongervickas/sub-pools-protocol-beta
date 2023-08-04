import { expect } from 'chai'
import { loadFixture, router, anyValue, ethers } from '../../fixtures'
import { FAKE_REGISTRY } from '../../helpers/address'

describe('Router', () => {
  describe('JoinNode', () => {
    it('should emit Router_NodeJoined on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts

      const tx = await routerContract.createNode([invited.address], FAKE_REGISTRY)
      const receipt = await tx.wait()

      const [parentNodeAddress] = receipt.logs[5].args

      const invitedRouterContract = routerContract.connect(invited) as any

      await expect(invitedRouterContract.joinNode(parentNodeAddress, []))
        .to.emit(invitedRouterContract, 'Router_NodeJoined')
        .withArgs(parentNodeAddress, anyValue)
    })

    it('should set parent address on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts

      const tx = await routerContract.createNode([invited.address], FAKE_REGISTRY)
      const receipt = await tx.wait()
      const [parentNodeAddress] = receipt.logs[5].args

      const invitedRouterContract = routerContract.connect(invited) as any

      const tx1 = await invitedRouterContract.joinNode(parentNodeAddress, [])
      const receipt1 = await tx1.wait()

      const [nodeParentAddress] = receipt1.logs[7].args

      expect(nodeParentAddress).to.equal(parentNodeAddress)
    })

    it('should set registry same as parent on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts

      const tx = await routerContract.createNode([invited.address], FAKE_REGISTRY)
      const receipt = await tx.wait()
      const [parentNodeAddress] = receipt.logs[5].args

      const parentNodeContract = await ethers.getContractAt('Node', parentNodeAddress)

      const invitedRouterContract = routerContract.connect(invited) as any

      const tx1 = await invitedRouterContract.joinNode(parentNodeAddress, [])
      const receipt1 = await tx1.wait()

      const [nodeRegistryAddress] = receipt1.logs[7].args

      const invitedNodeContract = await ethers.getContractAt('Node', nodeRegistryAddress)

      expect(await invitedNodeContract.registry()).to.equal(await parentNodeContract.registry())
    })
  })
})
