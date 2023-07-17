import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { ZERO_ADDRESS } from '../helpers/address'

describe('Router', () => {
  describe('Join', () => {
    it('should set registry address as same as parent on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const tx = await routerContract.registryAndCreate(ZERO_ADDRESS, [invited.address])
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)
      const rootNodeContract = await ethers.getContractAt('Node', nodeAddress)
      const rootNodeRegistryAddress = await rootNodeContract.registry()

      const routerContractInvitedInstance = routerContract.connect(invited) as any
      const tx1 = await routerContractInvitedInstance.join(nodeAddress, [])
      const receipt1 = await tx1.wait()
      const [nodeAddress1] = getReceiptArgs(receipt1)
      const nodeContract = await ethers.getContractAt('Node', nodeAddress1)
      const nodeRegistryAddress = await nodeContract.registry()
      expect(nodeRegistryAddress).to.equal(rootNodeRegistryAddress)
    })

    it('should emit NodeCreated on join', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registryAndCreate(ZERO_ADDRESS, [])
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await expect(routerContract.join(nodeAddress, [])).to.emit(routerContract, 'NodeCreated').withArgs(anyValue)
    })
  })
})
