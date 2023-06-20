import { SubPoolRouter, SubPoolRouterInterface } from './../typechain-types/contracts/SubPoolRouter'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

const DEFAULT_FEES_FRACTION = {
  value: ethers.toBigInt(1),
  divider: ethers.toBigInt(100),
} // 0.01

describe('SubPoolRouter', () => {
  async function deployRouterFixture() {
    const accounts = await ethers.getSigners()
    const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
    const subPoolRouter = await SubPoolRouter.deploy()

    return { accounts, subPoolRouter }
  }

  describe('Deploy', () => {
    it('should set initial ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)

      expect(await subPoolRouter.currentID()).to.equal(0)
    })
  })

  describe('Main', () => {
    it('should update next ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      await subPoolRouter.create(100, DEFAULT_FEES_FRACTION, [])

      expect(await subPoolRouter.currentID()).to.equal(1)
    })

    it('should set the main subpool initial balance', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)

      const amount = '1000'
      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[2].args
      const [, initialBalance] = await subPoolRouter.subPools(subPoolAddress)

      expect(initialBalance).to.deep.equal(ethers.toBigInt(amount))
    })

    it('should set the parent of main node as router itself', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      const amount = '1000'

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
      const receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[2].args

      const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)
      const parent = await subPoolNode.parent()

      expect(await subPoolRouter.getAddress()).to.equal(parent)
    })
  })

  describe('Node', () => {
    it('should join a parent subpool as node', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = '1000'
      const [, invited] = accounts

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter

      await expect(invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])).to.not.be.reverted
    })

    it('should set parent subpool when joined', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = '1000'
      const [, invited] = accounts

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx2 = await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])
      let receipt2 = await tx2.wait()
      const [subPoolAddress2] = receipt2.logs[6].args
      const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress2)
      const parentAddress = await subPoolNode.parent()

      expect(parentAddress).to.equal(subPoolAddress)
    })

    it('should update parent balance when joined', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = '1000'
      const [, invited] = accounts

      const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter
      await invitedRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])

      const [, , balance] = await subPoolRouter.subPools(subPoolAddress)

      expect(balance).to.equal(ethers.toBigInt(amount))
    })
  })

  describe('Validations', () => {
    describe('Node', () => {
      it('should revert when node manager is not invited', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = '1000'
        const [, , hacker] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[2].args

        const hackerRouterInstance = subPoolRouter.connect(hacker) as SubPoolRouter
        await expect(hackerRouterInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [])).to.be.rejectedWith(
          'NotInvited()'
        )
      })

      it('should revert when try to call deposit if sender is not node', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)
        const amount = '1000'

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[2].args

        await expect(subPoolRouter.deposit(subPoolAddress, amount)).to.be.rejectedWith('NodeNotAllowed()')
      })
    })
  })

  describe('Events', () => {
    describe('Main', () => {
      it('should emit SubPoolCreated on create a main node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, invited] = accounts
        subPoolRouter.connect(invited)

        const amount = '1000'

        await expect(subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolRouter, 'SubPoolCreated')
          .withArgs(anyValue, 1, amount)
      })
    })

    describe('Node', () => {
      it('should emit SubPoolJoined on create a node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = '1000'
        const [, invited] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(newInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolRouter, 'SubPoolJoined')
          .withArgs(anyValue, 1, amount)
      })

      it('should emit SubPoolDeposited when node deposit', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = '1000'
        const [, invited] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(newInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolRouter, 'SubPoolDeposited')
          .withArgs(anyValue, amount)
      })
    })
  })
})
