// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Vault} from './Vault.sol';
import {Router} from './Router.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';

contract Node {
    using Address for address;
    using SafeERC20 for IERC20;

    Router.Adapter public adapter;

    constructor(Router.Adapter memory adapter_) {
        adapter = adapter_;
    }

    function deposit(uint256[] memory amount, bytes memory data) external {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            Vault vault = adapter.vaultsIn[i];

            vault.withdraw(amount[i], address(this), address(this));

            IERC20(vault.asset()).approve(adapter.targetAddress, amount[i]);
        }

        address(adapter.targetAddress).functionCall(abi.encodePacked(adapter.functionSelector, data));

        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            Vault vault = adapter.vaultsIn[i];
            IERC20(vault.asset()).approve(adapter.targetAddress, 0);
        }
    }
}
