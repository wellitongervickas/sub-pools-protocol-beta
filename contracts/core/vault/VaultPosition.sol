// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';

contract VaultPosition {
    struct Position {
        bytes balance;
    }

    mapping(uint256 => Position) private _positions;

    function _createPosition(uint256 id_, bytes memory balance_) internal returns (uint256) {
        _positions[id_] = Position({balance: balance_});

        return id_;
    }

    function positions(uint256 id_) public view returns (Position memory) {
        return _positions[id_];
    }
}
