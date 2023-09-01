import { expect } from 'chai'
import { BytesLike, loadFixture, account, stake } from './fixtures'
import coderUtils from './utils/coder'

describe('Account: Deposit', () => {
  it('should deposit adapter', async () => {
    const amount = '1000000000000000000'
    const { stakeContract, tokenAddress, stakeAddress, tokenContract } = await loadFixture(stake.deployStakeFixture)

    const adapterSetup = {
      targetIn: stakeAddress,
      tokensIn: [tokenAddress],
      depositFunction: stakeContract.interface.getFunction('deposit')?.selector as BytesLike,
    }

    const { accountContract, accountAddress, accounts } = await loadFixture(
      account.deployAccountFixture.bind(this, adapterSetup)
    )

    await tokenContract.approve(accountAddress, amount)

    const amounts = [amount]
    const adapterData = coderUtils.encode([amounts], ['uint256[]'])
    const depositorAddress = accounts[0].address

    await accountContract.deposit(amounts, depositorAddress, adapterData)

    const balance = await tokenContract.balanceOf(stakeAddress)
    expect(balance.toString()).to.equal(amount)
  })
})
