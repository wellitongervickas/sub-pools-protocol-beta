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
      const routerContractAddress = await routerContract.getAddress()

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      await tokenContract.approve(routerContractAddress, amountValue)
      await tokenContract.transfer(invited.address, amountValue)
      await (tokenContract.connect(invited) as any).approve(routerContractAddress, amountValue)

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

      const FakeStrategy = await ethers.getContractFactory('FakeStrategySingle')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const routerContractAddress = await routerContract.getAddress()

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      await tokenContract.approve(routerContractAddress, amountValue)

      const tx = await routerContract.registryAndCreate(fakeStrategyAddress, [], amount)
      const receipt = await tx.wait()
      const [nodeAddress] = receipt.logs[4].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await tokenContract.approve(routerContractAddress, amountValue)

      await expect(routerContract.join(nodeAddress, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })

    it.skip('poc', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategySingle')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const routerContractAddress = await routerContract.getAddress()

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      await tokenContract.approve(routerContractAddress, amountValue)

      const tx = await routerContract.registryAndCreate(fakeStrategyAddress, [], amount)
      const receipt = await tx.wait()
      const [nodeAddress] = receipt.logs[4].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      await nodeContract.setInvitedOnly(false) // must be public to join without issue

      await tokenContract.approve(routerContractAddress, amountValue)

      await routerContract.join(nodeAddress, [], amount)

      console.log(await tokenContract.balanceOf(await nodeContract.registry()))
    })
  })
})
