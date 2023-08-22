// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Registry {
    using Counters for Counters.Counter;

    Counters.Counter private _currentAdapterId;

    struct Adapter {
        address target;
        IERC20[] assetsIn;
        IERC20[] assetsOut;
        bytes supplySelector;
        bytes assetsBalanceSelector;
        bytes withdrawSelector;
        bytes harvestSelector;
        bytes rewardsBalanceSelector;
    }

    mapping(bytes32 => Adapter) public adapters;

    event Registry_AdapterCreated(bytes32 id_);

    function createAdapter(Adapter memory adapter) public returns (bytes32 id) {
        id = _createAdapterId(adapter);

        adapters[id] = adapter;

        emit Registry_AdapterCreated(id);
    }

    function _createAdapterId(Adapter memory adapter) private returns (bytes32 id) {
        id = keccak256(abi.encodePacked(abi.encode(adapter), _currentAdapterId.current()));
        _currentAdapterId.increment();
    }
}
