import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'
import { createRandomAddress } from '../helpers/address'
import coderUtils from '../helpers/coder'

describe('Registry', () => {
  describe('Join', () => {
    it('should set account ID on join', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))

      const amount = coderUtils.build([100], ['uint256'])
      const accountAddress = createRandomAddress()
      await registryContract.joinAndDeposit(accountAddress, amount)

      const [id] = await registryContract.accounts(accountAddress)
      expect(id).to.equal(2)
    })

    it('should set account cashback on join', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))

      const amount = coderUtils.build([100], ['uint256'])
      const accountAddress = createRandomAddress()
      await registryContract.joinAndDeposit(accountAddress, amount)

      const [, cashback] = await registryContract.accounts(accountAddress)
      const [decompiledCashback] = coderUtils.decompile(cashback, ['uint256'])
      expect(decompiledCashback).to.equal(100)
    })

    it('should revert if try to join with an already joined account', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))

      const amount = coderUtils.build([100], ['uint256'])

      const accountAddress = createRandomAddress()
      await registryContract.joinAndDeposit(accountAddress, amount)

      await expect(registryContract.joinAndDeposit(accountAddress, amount)).to.be.revertedWithCustomError(
        registryContract,
        'AlreadyJoined()'
      )
    })

    it('should emit Joined event on join', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))
      const amount = coderUtils.build([100], ['uint256'])

      const accountAddress = createRandomAddress()
      await expect(registryContract.joinAndDeposit(accountAddress, amount))
        .to.emit(registryContract, 'Joined')
        .withArgs(accountAddress)
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

    it('should set account balance on join', async function () {})
  })
})
