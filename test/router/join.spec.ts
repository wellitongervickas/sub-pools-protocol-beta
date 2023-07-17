import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue, token } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { ZERO_ADDRESS } from '../helpers/address'
import coderUtils from '../helpers/coder'

describe('Router', () => {
  describe('Join', () => {
    it('should set registry address as same as parent on join', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts
      const amount = coderUtils.build([100], ['uint256'])
      const tx = await routerContract.registryAndCreate(fakeStrategyAddress, [invited.address], amount)
      const receipt = await tx.wait()
      const [nodeAddress] = receipt.logs[6].args
      const rootNodeContract = await ethers.getContractAt('Node', nodeAddress)
      const rootNodeRegistryAddress = await rootNodeContract.registry()

      const routerContractInvitedInstance = routerContract.connect(invited) as any
      const tx1 = await routerContractInvitedInstance.join(nodeAddress, [], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress1] = receipt1.logs[2].args
      const nodeContract = await ethers.getContractAt('Node', nodeAddress1)
      const nodeRegistryAddress = await nodeContract.registry()
      expect(nodeRegistryAddress).to.equal(rootNodeRegistryAddress)
    })

    it('should emit NodeCreated on join', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const amount = coderUtils.build([100], ['uint256'])
      const tx = await routerContract.registryAndCreate(fakeStrategyAddress, [], amount)
      const receipt = await tx.wait()
      const [nodeAddress] = receipt.logs[4].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await expect(routerContract.join(nodeAddress, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
