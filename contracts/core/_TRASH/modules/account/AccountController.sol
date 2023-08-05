// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';
import {IAccountController} from './IAccountController.sol';

contract AccountController is IAccountController {
    using Counters for Counters.Counter;

    /// @dev latest account ID
    Counters.Counter private currentID;

    /// @dev accounts mapping
    mapping(address => Account) private _accounts;

    /**
     * @notice create new account
     * @param _accountAddress the address of the account
     * @param _accountOwnerAddress the address of the account owner
     */
    function _setupAccount(address _accountAddress, address _accountOwnerAddress) internal {
        uint256 _id = _createID();
        _accounts[_accountAddress] = Account({id: _id, accountOwnerAddress: _accountOwnerAddress});
    }

    /**
     * @notice create new account ID
     * @return the new account ID
     */
    function _createID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    /// @inheritdoc IAccountController
    function accounts(address _accountAddress) public view returns (Account memory) {
        return _accounts[_accountAddress];
    }
}
