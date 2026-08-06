// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MarketplaceNFT} from "../src/MarketplaceNFT.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";

contract DeployMarketplace is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        vm.startBroadcast(deployerPrivateKey);

        NFTMarketplace marketplace = new NFTMarketplace();
        MarketplaceNFT nft = new MarketplaceNFT();

        console.log("NFTMarketplace deployed at:", address(marketplace));
        console.log("MarketplaceNFT deployed at:", address(nft));

        // Mint initial sample tokens for marketplace showcase
        nft.mintToken("https://ipfs.io/ipfs/bafybeigdyrzttxwhm32x7cxpt5g23v7ptw5e3ud5yhx6a4224hdmby75hu", 500); // 5% royalty
        nft.mintToken("https://ipfs.io/ipfs/bafybeicg4fxt3m2x7cxpt5g23v7ptw5e3ud5yhx6a4224hdmby75hu", 250); // 2.5% royalty

        vm.stopBroadcast();
    }
}
