// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {
    uint8 private _customDecimals;

    constructor(uint256 initialSupply, uint8 _decimals) ERC20('TestToken', 'TT') {
        _customDecimals = _decimals;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }
}
