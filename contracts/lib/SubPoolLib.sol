// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;


library SubPoolLib {
    struct SubPoolInfo {
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    function _initialDeposit(SubPoolInfo storage _self, uint256 _amount) internal {
        _self.initialBalance = _amount;
    }

    function _additionalDeposit(SubPoolInfo storage _self, uint256 _amount) internal {
        _self.balance += _amount;
    }

    function _checkSenderIsNode(SubPoolInfo storage _self, address _sender, address _subPoolAddress) internal view returns (bool) {
        return _sender == _subPoolAddress && _self.id > 0;
    }
}
