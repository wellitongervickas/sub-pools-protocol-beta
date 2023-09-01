// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IRouter} from './IRouter.sol';
import {Adapter} from '../lib/Adapter.sol';

contract Router is IRouter {
    mapping(bytes32 => Adapter.Setup) public _adapters;

    function adapters(bytes32 id_) external view override returns (Adapter.Setup memory adapter) {
        adapter = _adapters[id_];
    }

    function createAdapter(Adapter.Setup memory adapterSetup_) external returns (bytes32 id) {
        id = keccak256(abi.encodePacked(adapterSetup_.targetIn, uint256(1)));

        _adapters[id] = adapterSetup_;

        emit Router_AdapterCreated(id);
    }
}
