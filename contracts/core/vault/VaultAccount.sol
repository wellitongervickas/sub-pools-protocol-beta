// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';

contract VaultAccount {
    using Counters for Counters.Counter;
    Counters.Counter private _currentID;

    struct Account {
        uint256 id;
        address parentAddress;
    }

    mapping(address => Account) private _accounts;

    function _createAccount(address accountAddress_, address parentAddress_) internal returns (uint256) {
        uint256 id = _createID();
        _accounts[accountAddress_] = Account({id: id, parentAddress: parentAddress_});

        return id;
    }

    function _createID() private returns (uint256) {
        _currentID.increment();
        return _currentID.current();
    }

    function accounts(address _accountAddress) public view returns (Account memory) {
        return _accounts[_accountAddress];
    }
}
