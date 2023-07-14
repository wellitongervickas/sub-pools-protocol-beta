import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { RegistryType } from '../fixtures/types'
import { ZERO_ADDRESS, createRandomAddress } from '../helpers/address'
import { buildBytesSingleToken } from '../helpers/tokens'

describe('Router', () => {
  describe('Join', () => {
    it('should set registry token type as same as parent on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts
      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)
      const tx = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, tokenData, [invited.address])

      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)
      const rootNodeContract = await ethers.getContractAt('Node', nodeAddress)
      const rootNodeRegistryAddress = await rootNodeContract.registry()
      const rootNodeRegistryContract = await ethers.getContractAt('Registry', rootNodeRegistryAddress)
      const rootNodeRegistryTokenData = await rootNodeRegistryContract.tokenData()

      const routerContractInvitedInstance = routerContract.connect(invited) as any
      const tx1 = await routerContractInvitedInstance.registryAndJoin(nodeAddress, [])
      const receipt1 = await tx1.wait()
      const [nodeAddress1] = getReceiptArgs(receipt1)
      const nodeContract = await ethers.getContractAt('Node', nodeAddress1)

      const nodeRegistryAddress = await nodeContract.registry()
      const nodeRegistryContract = await ethers.getContractAt('Registry', nodeRegistryAddress)
      const nodeRegistryTokenData = await nodeRegistryContract.tokenData()

      expect(nodeRegistryTokenData).to.equal(rootNodeRegistryTokenData)
    })

    it('should set registry type as same as parent on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts
      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)
      const tx = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, tokenData, [invited.address])

      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)
      const rootNodeContract = await ethers.getContractAt('Node', nodeAddress)
      const rootNodeRegistryAddress = await rootNodeContract.registry()
      const rootNodeRegistryContract = await ethers.getContractAt('Registry', rootNodeRegistryAddress)
      const rootNodeRegistryType = await rootNodeRegistryContract.registryType()

      const routerContractInvitedInstance = routerContract.connect(invited) as any
      const tx1 = await routerContractInvitedInstance.registryAndJoin(nodeAddress, [])
      const receipt1 = await tx1.wait()
      const [nodeAddress1] = getReceiptArgs(receipt1)
      const nodeContract = await ethers.getContractAt('Node', nodeAddress1)

      const nodeRegistryAddress = await nodeContract.registry()
      const nodeRegistryContract = await ethers.getContractAt('Registry', nodeRegistryAddress)
      const nodeRegistryType = await nodeRegistryContract.registryType()

      expect(nodeRegistryType).to.equal(rootNodeRegistryType)
    })

    it('should emit NodeCreated on join', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registryAndCreate(RegistryType.SingleTokenRegistry, ZERO_ADDRESS, [])
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await expect(routerContract.registryAndJoin(nodeAddress, []))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
