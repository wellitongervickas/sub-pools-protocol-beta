// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Vault} from './Vault.sol';

contract Node is Ownable {
    Vault[] private _vaults;

    constructor(Vault[] memory vaults_) {
        _vaults = vaults_;
    }

    function vault(uint8 index_) external view returns (Vault) {
        return _vaults[index_];
    }
}
