import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue, token } from '../fixtures'
import coderUtils from '../helpers/coder'

describe('Router', () => {
  describe('Create', () => {
    it('should set node parent as itself on create', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const routerContractAddress = await routerContract.getAddress()

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      await tokenContract.approve(routerContractAddress, amountValue)

      const tx1 = await routerContract.registryAndCreate(fakeStrategyAddress, [], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[4].args

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })

    it('should emit NodeCreated on create', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const routerContractAddress = await routerContract.getAddress()

      const amountValue = '1000000000000000000'
      const amount = coderUtils.build([amountValue], ['uint256'])

      await tokenContract.approve(routerContractAddress, amountValue)
      await expect(routerContract.registryAndCreate(fakeStrategyAddress, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
