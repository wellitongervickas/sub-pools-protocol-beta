// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Registry} from './Registry.sol';

contract Account {
    Registry.Adapter public adapter;

    constructor(Registry.Adapter memory adapter_) {
        adapter = adapter_;
    }
}
