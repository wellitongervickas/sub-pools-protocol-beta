// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Registry {
    struct Adapter {
        address targetIn;
        IERC20[] tokensIn;
        bytes4 depositFunction;
        IERC20[] tokensOut;
        bytes4 withdrawFunction;
        IERC20[] tokensReward;
        bytes4 harvestFunction;
    }

    uint256 private _nextAdapterId;

    mapping(bytes32 => Adapter) public _adapters;

    event Registry_AdapterCreated(bytes32 id_);

    function getAdapter(bytes32 id_) public view returns (Adapter memory adapter) {
        adapter = _adapters[id_];
    }

    function createAdapter(Adapter memory adapterSetup_) external returns (bytes32 id) {
        id = _createAdapterId(adapterSetup_);

        _adapters[id] = adapterSetup_;

        emit Registry_AdapterCreated(id);
    }

    function _createAdapterId(Adapter memory adapterSetup_) private returns (bytes32 id) {
        id = keccak256(abi.encodePacked(adapterSetup_.targetIn, _createNewAdapterId()));
    }

    function _createNewAdapterId() private returns (uint256) {
        return _nextAdapterId++;
    }
}
