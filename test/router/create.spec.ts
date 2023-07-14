import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { RegistryType } from '../fixtures/types'
import { ZERO_ADDRESS } from '../helpers/address'

describe('Router', () => {
  describe('Create', () => {
    it('should emit NodeCreated on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)
      await expect(routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, ZERO_ADDRESS, []))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })

    it('should set node parent as itself on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx1 = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, ZERO_ADDRESS, [])
      const receipt1 = await tx1.wait()
      const [nodeAddress] = getReceiptArgs(receipt1)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })
  })
})
