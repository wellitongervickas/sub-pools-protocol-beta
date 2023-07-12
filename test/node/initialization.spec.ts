import { expect } from 'chai'
import { ethers } from '../fixtures'
import { ZERO_ADDRESS } from '../helpers/address'

describe('Node', () => {
  describe('Deploy', () => {
    it('should setup node parent on deploy', async function () {
      const accounts = await ethers.getSigners()
      const Node = await ethers.getContractFactory('Node')
      const nodeContract = await Node.deploy(ZERO_ADDRESS, accounts[0].address, [])

      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(ZERO_ADDRESS)
    })
  })
})
