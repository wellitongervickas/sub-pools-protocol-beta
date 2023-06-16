// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

library SubPoolLib {
    struct SubPool {
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    function _setBalance(SubPool storage _self, uint256 _amount) internal {
        _self.balance += _amount;
    }

    function _checkIsNode(
        SubPool storage _self,
        address _sender,
        address _subPoolAddress
    ) internal view returns (bool) {
        return _sender == _subPoolAddress && _self.id > 0;
    }
}
