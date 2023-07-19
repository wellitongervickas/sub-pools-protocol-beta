import { expect } from 'chai'
import { router, fakeStrategySingle, loadFixture, ethers, anyValue } from '../fixtures'
import coderUtils from '../helpers/coder'
import { createRandomAddress } from '../helpers/address'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_REQUIRED_INITIAL_AMOUNT } from '../helpers/tokens'

describe('Router', () => {
  describe('Create', () => {
    it('should deploy a root node on create', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      expect(
        await routerContract.create(
          registryAddress,
          [],
          initialAmount,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT
        )
      ).to.not.reverted
    })

    it('should set root node parent as router itself on create', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(
        registryAddress,
        [],
        initialAmount,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[2].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })

    it('should emit NodeCreated on create', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      await expect(
        routerContract.create(
          registryAddress,
          [],
          initialAmount,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT
        )
      )
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })

    it('should set root node as router child node on create', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      const tx1 = await routerContract.create(
        registryAddress,
        [],
        initialAmount,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[2].args

      const [id] = await routerContract.nodes(nodeAddress)

      expect(id).to.equal(1)
    })

    it('should emit RegistryJoined on create', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      await expect(
        routerContract.create(
          registryAddress,
          [],
          initialAmount,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT
        )
      )
        .to.emit(routerContract, 'RegistryJoined')
        .withArgs(registryAddress, anyValue, initialAmount)
    })

    it('should revert if try to create using a non-registry address', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      await expect(
        routerContract.create(
          createRandomAddress(),
          [],
          initialAmount,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT
        )
      ).to.be.revertedWithCustomError(routerContract, 'NonRegistry()')
    })

    it('should indalited registry after it used on a node', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const initialAmount = coderUtils.build(['0'], ['uint256']) // bypass allowance check

      await routerContract.create(
        registryAddress,
        [],
        initialAmount,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )

      await expect(
        routerContract.create(
          registryAddress,
          [],
          initialAmount,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT
        )
      ).to.be.revertedWithCustomError(routerContract, 'NonRegistry()')
    })
  })
})
