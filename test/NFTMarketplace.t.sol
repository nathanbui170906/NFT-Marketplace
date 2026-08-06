// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MarketplaceNFT.sol";
import "../src/NFTMarketplace.sol";

contract NFTMarketplaceTest is Test {
    MarketplaceNFT public nft;
    NFTMarketplace public marketplace;

    address public owner = address(1);
    address public seller = address(2);
    address public buyer1 = address(3);
    address public buyer2 = address(4);

    function setUp() public {
        vm.deal(seller, 100 ether);
        vm.deal(buyer1, 100 ether);
        vm.deal(buyer2, 100 ether);

        vm.startPrank(owner);
        marketplace = new NFTMarketplace();
        nft = new MarketplaceNFT();
        vm.stopPrank();

        // Mint an NFT to seller with 5% royalty (500 bps)
        vm.startPrank(seller);
        nft.mintToken("ipfs://QmTestMetadataURI", 500); // Token ID 1
        nft.setApprovalForAll(address(marketplace), true);
        vm.stopPrank();
    }

    function testMintNFT() public view {
        assertEq(nft.ownerOf(1), seller);
        assertEq(nft.tokenURI(1), "ipfs://QmTestMetadataURI");
    }

    function testListItemAndBuyItem() public {
        uint256 listingPrice = 2 ether;

        // Seller lists token 1
        vm.startPrank(seller);
        uint256 listingId = marketplace.listItem(address(nft), 1, listingPrice);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), address(marketplace));

        uint256 sellerBalBefore = seller.balance;

        // Buyer1 buys token 1
        vm.startPrank(buyer1);
        marketplace.buyItem{value: listingPrice}(listingId);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), buyer1);

        // Fee (2.5% of 2 ETH = 0.05 ETH)
        // Royalty (5% of 2 ETH = 0.1 ETH to seller as creator)
        // Seller payout = 2 - 0.05 - 0.1 = 1.85 ETH + 0.1 ETH royalty = 1.95 ETH
        assertEq(seller.balance, sellerBalBefore + 1.95 ether);
    }

    function testCreateAuctionAndBid() public {
        uint256 minPrice = 1 ether;
        uint256 duration = 3600; // 1 hour

        vm.startPrank(seller);
        uint256 auctionId = marketplace.createAuction(address(nft), 1, minPrice, duration);
        vm.stopPrank();

        // Buyer 1 bids 1.5 ETH
        vm.startPrank(buyer1);
        marketplace.placeBid{value: 1.5 ether}(auctionId);
        vm.stopPrank();

        // Buyer 2 outbids with 2 ETH (Buyer 1 refunded 1.5 ETH)
        uint256 buyer1BalBefore = buyer1.balance;
        vm.startPrank(buyer2);
        marketplace.placeBid{value: 2 ether}(auctionId);
        vm.stopPrank();

        assertEq(buyer1.balance, buyer1BalBefore + 1.5 ether);

        // Fast-forward time past auction end
        vm.warp(block.timestamp + duration + 1);

        // End auction
        marketplace.endAuction(auctionId);

        assertEq(nft.ownerOf(1), buyer2);
    }

    function testMakeAndAcceptOffer() public {
        // Buyer 1 places an offer of 3 ETH on Token 1
        vm.startPrank(buyer1);
        uint256 offerId = marketplace.makeOffer{value: 3 ether}(address(nft), 1);
        vm.stopPrank();

        // Seller accepts offer
        vm.startPrank(seller);
        nft.approve(address(marketplace), 1);
        marketplace.acceptOffer(offerId);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), buyer1);
    }
}
