import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue, token } from '../fixtures'
import coderUtils from '../helpers/coder'

describe('Router', () => {
  describe('Join', () => {
    it('should set registry address as same as parent on join', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategySingle')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      const tx0 = await routerContract.registry(fakeStrategyAddress)
      const receipt0 = await tx0.wait()
      const [registryAddress] = receipt0.logs[1].args

      await tokenContract.approve(registryAddress, amountValue)

      await tokenContract.transfer(invited.address, amountValue)
      await (tokenContract.connect(invited) as any).approve(registryAddress, amountValue)

      const tx = await routerContract.create(registryAddress, [invited.address], amount)
      const receipt = await tx.wait()
      const [nodeAddress] = receipt.logs[4].args
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

      const FakeStrategy = await ethers.getContractFactory('FakeStrategySingle')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[1].args

      await tokenContract.approve(registryAddress, amountValue)

      const tx1 = await routerContract.create(registryAddress, [], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[2].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await tokenContract.approve(registryAddress, amountValue)

      await expect(routerContract.join(nodeAddress, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
