import { expect } from 'chai'
import { BytesLike, loadFixture, account, stake, token, ethers } from './fixtures'
import coderUtils from './utils/coder'

describe('Account', () => {
  describe('Deposit', () => {
    it('should create position', async () => {
      const amount = '1000000000000000000'
      const { stakeContract, tokenAddress, stakeAddress, tokenContract } = await loadFixture(stake.deployStakeFixture)

      const adapterSetup = {
        targetIn: stakeAddress,
        tokensIn: [tokenAddress],
        tokensOut: [tokenAddress],
        tokensReward: [tokenAddress],
        depositFunction: stakeContract.interface.getFunction('deposit')?.selector as BytesLike,
        withdrawFunction: stakeContract.interface.getFunction('withdraw')?.selector as BytesLike,
        harvestFunction: stakeContract.interface.getFunction('harvest')?.selector as BytesLike,
      }

      const { accountContract, accountAddress, accounts } = await loadFixture(
        account.deployAccountFixture.bind(this, adapterSetup)
      )

      await tokenContract.approve(accountAddress, amount)

      const amounts = [amount]
      const adapterData = coderUtils.encode([amounts], ['uint256[]'])

      await accountContract.deposit(amounts, accounts[0].address, accounts[0].address, adapterData)
      const position = await accountContract.getPosition(accounts[0].address)
      const balanceOfStake = await tokenContract.balanceOf(stakeAddress)

      expect(position.amounts).to.deep.equal(amounts)
      expect(balanceOfStake).to.equal(amount)
    })
  })

  describe('Withdraw', () => {
    it('should withdraw position', async () => {
      const amount = '1000000000000000000'
      const { stakeContract, tokenAddress, stakeAddress, tokenContract } = await loadFixture(stake.deployStakeFixture)

      const adapterSetup = {
        targetIn: stakeAddress,
        tokensIn: [tokenAddress],
        tokensOut: [tokenAddress],
        tokensReward: [tokenAddress],
        depositFunction: stakeContract.interface.getFunction('deposit')?.selector as BytesLike,
        withdrawFunction: stakeContract.interface.getFunction('withdraw')?.selector as BytesLike,
        harvestFunction: stakeContract.interface.getFunction('harvest')?.selector as BytesLike,
      }

      const { accountContract, accountAddress, accounts } = await loadFixture(
        account.deployAccountFixture.bind(this, adapterSetup)
      )

      await tokenContract.approve(accountAddress, amount)

      const amounts = [amount]
      const adapterData = coderUtils.encode([amounts], ['uint256[]'])

      await accountContract.deposit(amounts, accounts[0].address, accounts[0].address, adapterData)
      const position = await accountContract.getPosition(accounts[0].address)
      const balanceOfStake = await tokenContract.balanceOf(stakeAddress)

      expect(position.amounts).to.deep.equal(amounts)
      expect(balanceOfStake).to.equal(amount)

      await accountContract.withdraw(amounts, accounts[0].address, accounts[0].address, adapterData)
      const position2 = await accountContract.getPosition(accounts[0].address)
      const balanceOfStake2 = await tokenContract.balanceOf(stakeAddress)

      expect(position2.amounts).to.deep.equal([0])
      expect(balanceOfStake2).to.equal(0)
    })
  })

  describe('Harvest', () => {
    it('should harvest position', async () => {
      const amount = '1000000000000000000'
      const { stakeContract, tokenAddress, stakeAddress, tokenContract } = await loadFixture(stake.deployStakeFixture)

      const adapterSetup = {
        targetIn: stakeAddress,
        tokensIn: [tokenAddress],
        tokensOut: [tokenAddress],
        tokensReward: [tokenAddress],
        depositFunction: stakeContract.interface.getFunction('deposit')?.selector as BytesLike,
        withdrawFunction: stakeContract.interface.getFunction('withdraw')?.selector as BytesLike,
        harvestFunction: stakeContract.interface.getFunction('harvest')?.selector as BytesLike,
      }

      const { accountContract, accountAddress, accounts } = await loadFixture(
        account.deployAccountFixture.bind(this, adapterSetup)
      )

      const [owner, receiver] = accounts

      await tokenContract.approve(accountAddress, amount)

      const amounts = [amount]
      const adapterDepositData = coderUtils.encode([amounts], ['uint256[]'])

      await accountContract.deposit(amounts, owner.address, owner.address, adapterDepositData)
      const balanceOfReceiver = await tokenContract.balanceOf(receiver)
      expect(balanceOfReceiver).to.equal(0)

      await tokenContract.transfer(stakeAddress, amount)
      const adapterHarvestData = '0x'
      await accountContract.harvest(amounts, receiver.address, owner.address, adapterHarvestData)

      const balanceOfReceiver2 = await tokenContract.balanceOf(receiver)
      expect(balanceOfReceiver2).to.equal(amount)
    })
  })
})
