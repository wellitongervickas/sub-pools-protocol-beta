import { expect } from 'chai'
import { loadFixture, router, token, vault } from '../fixtures'

describe('Router', () => {
  describe('Node', () => {
    describe('Create', () => {
      it('should emit Router_NodeCreated on create', async function () {
        const { tokenAddress } = await loadFixture(token.deployTokenFixture)
        const { routerContract, vaultFactoryContract } = await loadFixture(router.deployRouterFixture)

        const tx = await vaultFactoryContract.createVault(tokenAddress, 'vUSDC', 'USD Coin Vault')
        const receipt = await tx.wait()
        const [vaultAddress] = receipt.logs[0].args

        await expect(routerContract.createNode([vaultAddress], [vaultAddress])).to.emit(
          routerContract,
          'Router_NodeCreated'
        )
      })
    })
  })

  describe('Vault', () => {
    describe('Create', () => {
      it('should emit Router_VaultCreated on create', async function () {
        const { tokenAddress } = await loadFixture(token.deployTokenFixture)
        const { routerContract } = await loadFixture(router.deployRouterFixture)

        await expect(routerContract.createVault(tokenAddress, 'vUSDC', 'USD Coin Vault')).to.emit(
          routerContract,
          'Router_VaultCreated'
        )
      })
    })
  })
})
