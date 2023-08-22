// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Registry {
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
        id = keccak256(abi.encodePacked(abi.encode(adapter)));

        adapters[id] = adapter;

        emit Registry_AdapterCreated(id);
    }
}
