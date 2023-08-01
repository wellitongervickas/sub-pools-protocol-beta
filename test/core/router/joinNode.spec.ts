import { expect } from 'chai'
import { loadFixture, router, anyValue } from '../../fixtures'

describe('Router', () => {
  describe('JoinNode', () => {
    it('should emit Router_NodeJoined on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts

      const tx = await routerContract.createNode([invited.address])
      const receipt = await tx.wait()

      const [parentNodeAddress] = receipt.logs[7].args

      const invitedRouterContract = routerContract.connect(invited) as any

      await expect(invitedRouterContract.joinNode(parentNodeAddress, []))
        .to.emit(invitedRouterContract, 'Router_NodeJoined')
        .withArgs(parentNodeAddress, anyValue)
    })

    it('should set parent address on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts

      const tx = await routerContract.createNode([invited.address])
      const receipt = await tx.wait()
      const [parentNodeAddress] = receipt.logs[7].args

      const invitedRouterContract = routerContract.connect(invited) as any

      const tx1 = await invitedRouterContract.joinNode(parentNodeAddress, [])
      const receipt1 = await tx1.wait()

      const [nodeParentAddress] = receipt1.logs[9].args

      expect(nodeParentAddress).to.equal(parentNodeAddress)
    })
  })
})
