// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

abstract contract ERC20Adapter {
    function _receiveTokensFromDepositor(
        IERC20[] memory tokens_,
        address depositor_,
        uint256[] memory amount_
    ) internal {
        for (uint256 index = 0; index < tokens_.length; index++) {
            tokens_[index].transferFrom(depositor_, address(this), amount_[index]);
        }
    }

    function _approveTokensToSpender(IERC20[] memory tokens_, address spender_, uint256[] memory amount_) internal {
        for (uint256 index = 0; index < tokens_.length; index++) {
            tokens_[index].approve(spender_, amount_[index]);
        }
    }
}
