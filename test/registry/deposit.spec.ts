import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'

describe('Registry', () => {
  describe('Deposit', () => {
    it('should deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(registryAddress, initialAmount)
      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)

      const [, initialBalance] = await registryContract.accounts(otherAccount.address)

      expect(initialBalance).to.equal(initialAmount)
    })

    it('should emit Deposited when deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

      await expect(registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount))
        .to.emit(registryContract, 'Deposited')
        .withArgs(otherAccount.address, initialAmount)
    })

    it('should transfer funds to strategy when deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)
      expect(await tokenContract.balanceOf(fakeStrategyAddress)).to.equal(initialAmountNumber)
    })

    it('should revert if try to deposit to account without being the owner', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

      await expect(
        (registryContract.connect(otherAccount) as any).deposit(
          otherAccount.address,
          otherAccount.address,
          initialAmount
        )
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })

    it.skip('should charge fees from parent account when deposit to account', async function () {})
  })
})
