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

    await accountContract.deposit(amounts, accounts[0].address, adapterData)

    const balance = await tokenContract.balanceOf(stakeAddress)
    const position = await accountContract.getPosition(accounts[0].address)

    expect(balance.toString()).to.equal(amount)
    expect(position.amounts).to.deep.equal(amounts)
  })
})
