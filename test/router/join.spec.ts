import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { RegistryType } from '../fixtures/types'

describe('Router', () => {
  describe('Join', () => {
    it('should emit NodeCreated on join', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, [])
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await expect(routerContract.registryAndJoin(nodeAddress, RegistryType.SingleTokenRegistry, []))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
