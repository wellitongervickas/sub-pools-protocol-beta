import { DEFAULT_REQUIRED_INITIAL_BALANCE } from './../fixtures'
import { expect } from 'chai'

import {
  deployNodeFixture,
  deployRoutedNodeFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  MANAGER_ROLE,
  ethers,
  SubPoolRouter,
  SubPoolNode,
  time,
  DEFAULT_PERIOD_LOCK,
} from '../fixtures'

describe('SubPoolNode', () => {
  describe('Validations', () => {
    describe('Parent', () => {
      it('should revert if try to update parent twice', async function () {
        const [, anyEntity] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        await subPoolNode.setParent(anyEntity.address)
        await expect(subPoolNode.setParent(anyEntity.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ParentAlreadySet()'
        )
      })

      it('should revert on set parent if not manager role', async function () {
        const [, anyEntity] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        const subPoolInstance = subPoolNode.connect(anyEntity) as SubPoolNode

        await expect(subPoolInstance.setParent(anyEntity.address)).to.be.rejectedWith(
          'Ownable: caller is not the owner'
        )
      })
    })

    describe('Invite', () => {
      it('should revert when manager try to invite himself', async function () {
        const [manager] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        await expect(subPoolNode.invite(manager.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ManagerNotAllowed()'
        )
      })

      it('should revert on invite an already invited node manager', async function () {
        const [, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        await subPoolNode.invite(invited.address)

        await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(subPoolNode, 'AlreadyInvited()')
      })

      it('should revert on invite an already node manager', async function () {
        const amount = 100
        const [, invited, node] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
        const subNodeAddress = await subPoolNode.getAddress()

        const invitedRouterInstance = subPoolRouter.connect(invited) as any
        await invitedRouterInstance.join(
          subNodeAddress,
          amount,
          DEFAULT_FEES_FRACTION,
          [node.address],
          DEFAULT_PERIOD_LOCK
        )

        await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'AlreadyNodeManager()'
        )
      })

      it('should revert on invite a node manager if not the manager role', async function () {
        const [, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        const subPoolInstance = subPoolNode.connect(invited) as SubPoolNode

        await expect(subPoolInstance.invite(invited.address)).to.be.rejectedWith(
          `AccessControl: account ${invited.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
        )
      })
    })

    describe('Join', () => {
      it('should revert on join as node without a parent subpool', async function () {
        const { subPoolNode } = await loadFixture(deployNodeFixture)
        const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture)

        const subPoolAddress = await subPoolNode2.getAddress()

        await expect(subPoolNode.join(subPoolAddress, 0)).to.be.revertedWithCustomError(subPoolNode, 'ParentNotFound()')
      })

      it('should revert if try to join setting manually the parent as a main subpool', async function () {
        const [, , hacker] = await ethers.getSigners()
        const { subPoolNode: subPoolNodeDefault } = await loadFixture(deployRoutedNodeFixture)

        const defaultSubPoolNodeAddress = await subPoolNodeDefault.getAddress()
        const SubPoolNode = await ethers.getContractFactory('SubPoolNode', hacker)

        const subPoolNode = await SubPoolNode.deploy(
          hacker.address,
          100,
          DEFAULT_FEES_FRACTION,
          [hacker.address],
          DEFAULT_PERIOD_LOCK,
          DEFAULT_REQUIRED_INITIAL_BALANCE
        )
        const subPoolNode2 = await SubPoolNode.deploy(
          hacker.address,
          100,
          DEFAULT_FEES_FRACTION,
          [hacker.address],
          DEFAULT_PERIOD_LOCK,
          DEFAULT_REQUIRED_INITIAL_BALANCE
        )

        const subPoolNode2Address = await subPoolNode2.getAddress()
        await subPoolNode.setParent(defaultSubPoolNodeAddress)

        await expect(subPoolNode.join(subPoolNode2Address, 100)).to.be.revertedWithCustomError(
          subPoolNode,
          'NotAllowed()'
        )
      })

      it('should revert on join as node without being invited', async function () {
        const [, , hacker] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const subPoolRouterInstance = subPoolRouter.connect(hacker) as SubPoolRouter

        await expect(
          subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, [], DEFAULT_PERIOD_LOCK)
        ).to.be.revertedWithCustomError(subPoolNode, 'NotInvited()')
      })

      it('should revert on call join without being the owner', async function () {
        const [, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture)
        const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(this, invited.address))

        const subNodeAddress2 = await subPoolNode2.getAddress()
        const newSubPoolInstance = subPoolNode.connect(invited) as SubPoolNode

        await expect(newSubPoolInstance.join(subNodeAddress2, 0)).to.be.rejectedWith('Ownable: caller is not the owner')
      })
    })

    describe('Deposit', () => {
      it('should revert when try to call deposit if sender is not node', async function () {
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        await expect(subPoolNode.deposit(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
      })
    })

    describe('Additional deposit', () => {
      it('should revert if try to call manager additional deposit without being the manager', async function () {
        const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)

        await expect(subPoolNode.additionalDeposit(ethers.toBigInt(100))).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })
    })

    describe('Withdraw ', () => {
      it('should revert if try to withdraw balance without being the owner', async function () {
        const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)

        await expect(subPoolNode.withdrawBalance(ethers.toBigInt(100))).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })

      it('should revert if try to withdraw initial balance without being the owner', async function () {
        const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)

        await expect(subPoolNode.withdrawInitialBalance(ethers.toBigInt(100))).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })

      it('should revert when try to call withdraw if sender is not node', async function () {
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        await expect(subPoolNode.withdraw(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
      })

      it('should revert when try to call cashback if sender is not node', async function () {
        const { subPoolNode } = await loadFixture(deployNodeFixture)

        await expect(subPoolNode.cashback(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
      })

      it('should revert if try to withdraw initial balance in locked period', async function () {
        const [manager] = await ethers.getSigners()

        const amount = ethers.toBigInt(1000)

        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
        const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, amount, DEFAULT_FEES_FRACTION, [], unlockTime)
        )

        await expect(subPoolNode.withdrawInitialBalance(amount)).to.be.revertedWithCustomError(
          subPoolNode,
          'LockPeriod()'
        )
      })
    })
  })
})
