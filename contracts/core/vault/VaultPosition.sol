// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';

contract VaultPosition {
    struct Position {
        uint256[] shares;
    }

    mapping(uint256 => Position) private _positions;

    function _createPosition(uint256 id_, uint256[] memory amount_) internal returns (uint256) {
        _positions[id_] = Position({shares: amount_});

        return id_;
    }

    function positions(uint256 id_) public view returns (Position memory) {
        return _positions[id_];
    }
}
