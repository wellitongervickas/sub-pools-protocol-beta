import { expect } from 'chai'
import { loadFixture, router, anyValue, ethers } from '../../fixtures'
import { createRandomAddress } from '../../helpers/address'

describe('Router', () => {
  describe('JoinNode', () => {
    it('should emit Router_NodeJoined on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts

      const tx = await routerContract.createNode([invited.address])
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

      const tx = await routerContract.createNode([invited.address])
      const receipt = await tx.wait()
      const [parentNodeAddress] = receipt.logs[5].args

      const invitedRouterContract = routerContract.connect(invited) as any

      const tx1 = await invitedRouterContract.joinNode(parentNodeAddress, [])
      const receipt1 = await tx1.wait()

      const [nodeParentAddress] = receipt1.logs[7].args

      expect(nodeParentAddress).to.equal(parentNodeAddress)
    })

    it('should revert if try to join a node that does not registered', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts
      const invitedRouterContract = routerContract.connect(invited) as any

      await expect(invitedRouterContract.joinNode(createRandomAddress(), [])).to.be.revertedWithCustomError(
        invitedRouterContract,
        'Router_OnlyTrustedNode()'
      )
    })

    it('should revert if try to join a node that is untrusted', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [, invited] = accounts
      const invitedRouterContract = routerContract.connect(invited) as any

      const tx = await routerContract.createNode([invited.address])
      const receipt = await tx.wait()
      const [parentNodeAddress] = receipt.logs[5].args

      await routerContract.trustNode(parentNodeAddress, false)

      await expect(invitedRouterContract.joinNode(parentNodeAddress, [])).to.be.revertedWithCustomError(
        invitedRouterContract,
        'Router_OnlyTrustedNode()'
      )
    })
  })
})
