import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_REQUIRED_INITIAL_AMOUNT } from '../helpers/tokens'

describe('Registry', () => {
  describe('Additional Deposit', () => {
    it('should additional deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(registryAddress, initialAmountNumber)
      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)

      const [, , additionalBalance] = await registryContract.accounts(otherAccount.address)

      expect(additionalBalance).to.equal(initialAmount)
    })

    it('should increase additional balance on deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const totalAmountNumber = '2000000000000000000'
      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const expectedAmount = coderUtils.build([totalAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )

      await tokenContract.transfer(otherAccount.address, totalAmountNumber)
      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, totalAmountNumber)

      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)
      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)

      const [, , additionalBalance] = await registryContract.accounts(otherAccount.address)
      expect(additionalBalance).to.equal(expectedAmount)
    })

    it('should emit Deposited when additional deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(registryAddress, initialAmountNumber)

      await expect(registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount))
        .to.emit(registryContract, 'Deposited')
        .withArgs(otherAccount.address, initialAmount)
    })

    it('should transfer funds to strategy when additional deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)
      expect(await tokenContract.balanceOf(fakeStrategyAddress)).to.equal(initialAmountNumber)
    })

    it('should revert if try to additional deposit to account without being the owner', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

      await expect(
        (registryContract.connect(otherAccount) as any).additionalDeposit(
          otherAccount.address,
          otherAccount.address,
          initialAmount
        )
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })
  })
})
