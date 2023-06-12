import { SubPoolRouter } from './../typechain-types/contracts/SubPoolRouter'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

describe('SubPoolRouter', () => {
  async function deployRouterFixture() {
    const accounts = await ethers.getSigners()
    const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
    const subPoolRouter = await SubPoolRouter.deploy()

    return { accounts, subPoolRouter }
  }

  describe('MainSubPool', () => {
    describe('Deploy', () => {
      it('should set the right owner', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const [owner] = accounts

        expect(await subPoolRouter.owner()).to.equal(owner.address)
      })

      it('should set the right initial main subpool ID', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)

        expect(await subPoolRouter.nextMainPoolID()).to.equal(0)
      })
    })

    describe('Create Main', () => {
      it('should update next ID', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)

        await subPoolRouter.createMain(100)

        expect(await subPoolRouter.nextMainPoolID()).to.equal(1)
      })

      it('should set the parent main subpool as router contract', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)
        const amount = 1000

        const tx = await subPoolRouter.createMain(amount)
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[2].args
        const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)
        const parent = await subPoolNode.parentSubPool()

        expect(await subPoolRouter.getAddress()).to.equal(parent)
      })

      it('should set the main subpool initial balance', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)

        const amount = 1000
        const tx = await subPoolRouter.createMain(amount)
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[2].args
        const [id, initialBalance, balance] = await subPoolRouter.subPools(subPoolAddress)

        expect({
          id: id.toString(),
          initialBalance: initialBalance.toString(),
          balance: balance.toString(),
        }).to.deep.equal({
          id: '1',
          initialBalance: `${amount}`,
          balance: '0',
        })
      })
    })

    describe('Create Node', () => {
      it('should join a parent subpool as node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = 1000
        const [owner] = accounts

        const tx = await subPoolRouter.createMain(amount)
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[2].args
        const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)
        await subPoolNode.invite(owner)

        const tx2 = await subPoolRouter.createNode.populateTransaction(subPoolAddress, amount)
        const result = await owner.call(tx2)
        const decodedResult = ethers.AbiCoder.defaultAbiCoder().decode(['address', 'uint256'], result)

        expect(ethers.isAddress(decodedResult[0])).to.be.true
      })
    })

    describe('Validations', () => {
      it('should revert if the account is not allowed', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, hacker] = accounts

        const newInstance = subPoolRouter.connect(hacker) as SubPoolRouter

        await expect(newInstance.createMain(1000)).to.be.revertedWith('Ownable: caller is not the owner')
      })
    })

    describe('Events', () => {
      it('should emit SubPoolMainCreated on create a main pool', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, other] = accounts
        subPoolRouter.connect(other)

        const amount = 1000

        await expect(subPoolRouter.createMain(amount))
          .to.emit(subPoolRouter, 'SubPoolMainCreated')
          .withArgs(anyValue, 1, amount)
      })
    })
  })
})

//   const accounts = await ethers.getSigners()
//   const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
//   const subPoolRouter = await SubPoolRouter.deploy()
//   const tx = await subPoolRouter.createMain(amount)
//   let receipt = await tx.wait()
//   const contractInterface = subPoolRouter.interface
//   const result = contractInterface.decodeEventLog('SubPoolMainCreated', receipt.logs[2].data, receipt.logs[2].topics)
//   console.log(...receipt.logs[2].data)
//   console.log(receipt.logs[2].args[0])
