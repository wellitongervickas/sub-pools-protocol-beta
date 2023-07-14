import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { RegistryType } from '../fixtures/types'
import { createRandomAddress } from '../helpers/address'
import { buildBytesSingleToken } from '../helpers/tokens'

describe('Router', () => {
  describe('Create', () => {
    it('should set registry type on create', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)

      const tx = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, tokenData, [invited.address])
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)
      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const nodeRegistryAddress = await nodeContract.registry()
      const nodeRegistryContract = await ethers.getContractAt('Registry', nodeRegistryAddress)
      const nodeRegistryType = await nodeRegistryContract.registryType()

      expect(nodeRegistryType).to.equal(RegistryType.SingleTokenRegistry)
    })

    it('should set registry token data on create', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts
      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)
      const tx = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, tokenData, [invited.address])
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)
      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const nodeRegistryAddress = await nodeContract.registry()
      const nodeRegistryContract = await ethers.getContractAt('Registry', nodeRegistryAddress)
      const nodeRegistryTokenData = await nodeRegistryContract.tokenData()

      expect(nodeRegistryTokenData).to.equal(tokenData)
    })

    it('should set node parent as itself on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)

      const tx1 = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, tokenData, [])
      const receipt1 = await tx1.wait()
      const [nodeAddress] = getReceiptArgs(receipt1)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })

    it('should emit NodeCreated on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)

      await expect(routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, tokenData, []))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
