import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token } from '../fixtures'
import { createRandomAddress } from '../helpers/address'
import coderUtils from '../helpers/coder'

describe('Registry', () => {
  describe('Deposit', () => {
    it('should deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      const registryAddress = await registryContract.getAddress()

      const amountNumber = '1000000000000000000'

      const amount = coderUtils.build([amountNumber], ['uint256'])

      await registryContract.setupAccount(otherAccount.address)

      await tokenContract.transfer(otherAccount.address, amountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, amount)

      await registryContract.deposit(otherAccount.address, otherAccount.address, amount)

      const [, initialBalance] = await registryContract.accounts(otherAccount.address)

      expect(initialBalance).to.equal(amount)
    })

    it('should emit Deposited when deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      const registryAddress = await registryContract.getAddress()

      const amountNumber = '1000000000000000000'

      const amount = coderUtils.build([amountNumber], ['uint256'])

      await registryContract.setupAccount(otherAccount.address)

      await tokenContract.transfer(otherAccount.address, amountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, amount)

      await expect(registryContract.deposit(otherAccount.address, otherAccount.address, amount))
        .to.emit(registryContract, 'Deposited')
        .withArgs(otherAccount.address, amount)
    })
  })
})
