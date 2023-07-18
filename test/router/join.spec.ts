import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue, token, fakeStrategySingle } from '../fixtures'
import coderUtils from '../helpers/coder'

describe('Router', () => {
  describe('Join', () => {
    it('should deploy a node on join', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(registryAddress, [invited.address], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[4].args

      const invitedRouterInstance = routerContract.connect(invited) as any

      expect(await invitedRouterInstance.join(nodeAddress, [], amount)).to.not.reverted
    })

    it('should set node parent on join', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(registryAddress, [invited.address], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[4].args

      const invitedRouterInstance = routerContract.connect(invited) as any
      const tx2 = await invitedRouterInstance.join(nodeAddress, [], amount)
      const receipt2 = await tx2.wait()
      const [nodeAddress1] = receipt2.logs[2].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress1)
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(nodeAddress)
    })

    it('should use same registry as parent on join', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(registryAddress, [invited.address], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[4].args

      const invitedRouterInstance = routerContract.connect(invited) as any
      const tx2 = await invitedRouterInstance.join(nodeAddress, [], amount)
      const receipt2 = await tx2.wait()
      const [nodeAddress1] = receipt2.logs[2].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress1)
      const registryAddress1 = await nodeContract.registry()

      expect(registryAddress1).to.equal(registryAddress)
    })

    it('should emit NodeCreated on join', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(registryAddress, [invited.address], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[4].args

      const invitedRouterInstance = routerContract.connect(invited) as any

      await expect(invitedRouterInstance.join(nodeAddress, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })

    it('should emit RegistryJoined on join', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, invited] = accounts

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(registryAddress, [invited.address], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[4].args

      const invitedRouterInstance = routerContract.connect(invited) as any

      await expect(invitedRouterInstance.join(nodeAddress, [], amount))
        .to.emit(routerContract, 'RegistryJoined')
        .withArgs(registryAddress, anyValue, amount)
    })
  })
})
