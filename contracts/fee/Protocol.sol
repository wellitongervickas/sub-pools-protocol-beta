// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IProtocol} from '../interfaces/fee/IProtocol.sol';
import {FractionLib} from '../libraries/Fraction.sol';
import {Manager, IManager} from '../manager/Manager.sol';

contract Protocol is IProtocol, Manager {
    address public treasuryAddress;
    FractionLib.Fraction private _protocolFees;

    modifier onlyManager(address _address) {
        if (!IManager(_address).hasRoleManager(msg.sender)) revert IManager.InvalidManager();
        _;
    }

    constructor(address _treasuryAddress, FractionLib.Fraction memory _fees) {
        _setManagerRole(msg.sender);
        _setTreasuryAddress(_treasuryAddress);
        _setProtocolFees(_fees);
    }

    function setTreasuryAddress(address _treasuryAddress) external onlyManager(address(this)) {
        _setTreasuryAddress(_treasuryAddress);
    }

    function _setTreasuryAddress(address _treasuryAddress) private {
        treasuryAddress = _treasuryAddress;
    }

    function setProtocolFees(FractionLib.Fraction memory _fees) external onlyManager(address(this)) {
        _setProtocolFees(_fees);
    }

    function _setProtocolFees(FractionLib.Fraction memory _fees) private {
        _protocolFees = _fees;
    }

    function protocolFees() external view returns (FractionLib.Fraction memory) {
        return _protocolFees;
    }
}
