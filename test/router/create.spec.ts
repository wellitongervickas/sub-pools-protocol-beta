import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue, token } from '../fixtures'
import coderUtils from '../helpers/coder'

describe('Router', () => {
  describe('Create', () => {
    it('should set node parent as itself on create', async function () {
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
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })

    it('should emit NodeCreated on create', async function () {
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

      await expect(routerContract.create(registryAddress, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
