import { expect } from 'chai'
import { loadFixture, registry, ethers, token, anyValue } from '../fixtures'
import { createRandomAddress } from '../helpers/address'
import coderUtils from '../helpers/coder'

describe('Registry', () => {
  describe('Join', () => {
    it('should set account cashback on join', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, fakeStrategyAddress))
      const registryContractAddress = await registryContract.getAddress()

      const amountNumber = '1000000000000000000'
      const amount = coderUtils.build([amountNumber], ['uint256'])
      const accountAddress = createRandomAddress()

      await tokenContract.approve(registryContractAddress, amountNumber)
      await registryContract.joinAndDeposit(accountAddress, amount)

      const [, cashback] = await registryContract.accounts(accountAddress)
      const [decompiledCashback] = coderUtils.decompile(cashback, ['uint256'])
      expect(decompiledCashback).to.equal(amountNumber)
    })

    it('should revert if try to join with an already joined account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, fakeStrategyAddress))
      const registryContractAddress = await registryContract.getAddress()

      const amountNumber = '1000000000000000000'
      const amount = coderUtils.build([amountNumber], ['uint256'])
      const accountAddress = createRandomAddress()

      await tokenContract.approve(registryContractAddress, amountNumber)
      await registryContract.joinAndDeposit(accountAddress, amount)

      await expect(registryContract.joinAndDeposit(accountAddress, amount)).to.be.revertedWithCustomError(
        registryContract,
        'AlreadyJoined()'
      )
    })

    it('should emit Joined event on join', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const tokenAddress = await tokenContract.getAddress()

      const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
      const fakeStrategy = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
      const fakeStrategyAddress = await fakeStrategy.getAddress()

      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, fakeStrategyAddress))
      const registryContractAddress = await registryContract.getAddress()

      const amountNumber = '1000000000000000000'
      const amount = coderUtils.build([amountNumber], ['uint256'])
      const accountAddress = createRandomAddress()

      await tokenContract.approve(registryContractAddress, amountNumber)
      await expect(registryContract.joinAndDeposit(accountAddress, amount))
        .to.emit(registryContract, 'Joined')
        .withArgs(accountAddress, anyValue)
    })

    it('should revert if try to join without being the owner', async function () {
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, createRandomAddress())
      )
      const [, account] = accounts
      const amount = coderUtils.build([100], ['uint256'])

      const accountAddress = createRandomAddress()
      const registryContractAccountInstance = registryContract.connect(account) as any
      await expect(registryContractAccountInstance.joinAndDeposit(accountAddress, amount)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
