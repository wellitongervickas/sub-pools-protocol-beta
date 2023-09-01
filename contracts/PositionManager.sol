// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

contract PositionManager {
    struct Position {
        uint32 id;
        uint256[] amounts;
    }

    uint32 private _nextPositionId;

    mapping(address => Position) private _position;

    function getPosition(address owner_) public view returns (Position memory) {
        return _position[owner_];
    }

    function hasPosition(address owner_) public view returns (bool) {
        return _position[owner_].id > 0;
    }

    function _createPosition(address owner_, uint256[] memory amounts_) internal returns (Position memory) {
        return _position[owner_] = Position({id: _createPositionId(), amounts: amounts_});
    }

    function _createPositionId() private returns (uint32) {
        return _nextPositionId++;
    }

    function _increasePositionAmount(uint256[] memory amount_, address owner_) internal returns (Position memory) {
        for (uint256 i = 0; i < amount_.length; i++) {
            _position[owner_].amounts[i] += amount_[i];
        }

        return getPosition(owner_);
    }

    function _setPosition(uint256[] memory amounts_, address owner_) internal returns (Position memory) {
        if (hasPosition(owner_)) {
            return _increasePositionAmount(amounts_, owner_);
        }

        return _createPosition(owner_, amounts_);
    }
}
