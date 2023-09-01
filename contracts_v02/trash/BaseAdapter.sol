// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

abstract contract BaseAdapter {
    bytes assetsIn;
    bytes assetsOut;

    constructor(bytes memory assetsIn_, bytes memory assetsOut_) {
        assetsIn = assetsIn_;
        assetsOut = assetsOut_;
    }

    function getAssetsIn() public view virtual returns (bytes memory) {
        return assetsIn;
    }

    function getAssetsOut() public view virtual returns (bytes memory) {
        return assetsOut;
    }

    function balanceOf(address receiver_, bytes memory amount_) public view virtual returns (bytes memory) {}

    function deposit(address receiver_, bytes memory assets_) public virtual returns (bytes memory) {}

    function mint(address receiver_, bytes memory shares_) public virtual returns (bytes memory) {}

    function withdraw(address receiver_, bytes memory assets_) public virtual returns (bytes memory) {}

    function redeem(address receiver_, bytes memory shares_) public virtual returns (bytes memory) {}
}
