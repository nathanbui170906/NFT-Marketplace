// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @notice Advanced NFT Marketplace contract supporting fixed-price listings, timed auctions, direct ETH offers, and ERC2981 royalty payouts.
 */
contract NFTMarketplace is ReentrancyGuard, Ownable, IERC721Receiver {
    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    enum ListingStatus { Active, Sold, Canceled }
    enum AuctionStatus { Active, Ended, Canceled }
    enum OfferStatus { Pending, Accepted, Canceled }

    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        ListingStatus status;
    }

    struct Auction {
        uint256 auctionId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 minPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        AuctionStatus status;
    }

    struct Offer {
        uint256 offerId;
        address nftContract;
        uint256 tokenId;
        address offeror;
        uint256 offerPrice;
        OfferStatus status;
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------

    uint256 public feePercentageBps = 250; // 2.5% default platform fee
    uint256 public constant BPS_DENOMINATOR = 10000;

    uint256 private _listingIdCounter;
    uint256 private _auctionIdCounter;
    uint256 private _offerIdCounter;

    // listingId => Listing
    mapping(uint256 => Listing) public listings;
    // auctionId => Auction
    mapping(uint256 => Auction) public auctions;
    // offerId => Offer
    mapping(uint256 => Offer) public offers;

    // Helper map: nftContract => tokenId => listingId
    mapping(address => mapping(uint256 => uint256)) public activeListingId;
    // Helper map: nftContract => tokenId => auctionId
    mapping(address => mapping(uint256 => uint256)) public activeAuctionId;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event ItemListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCanceled(uint256 indexed listingId);
    event ListingPriceUpdated(uint256 indexed listingId, uint256 newPrice);

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 minPrice,
        uint256 duration
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event AuctionCanceled(uint256 indexed auctionId);

    event OfferMade(
        uint256 indexed offerId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address offeror,
        uint256 offerPrice
    );

    event OfferAccepted(
        uint256 indexed offerId,
        address indexed seller,
        address indexed offeror,
        uint256 offerPrice
    );

    event OfferCanceled(uint256 indexed offerId);

    event FeePercentageUpdated(uint256 newFeeBps);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() Ownable(msg.sender) {}

    // -------------------------------------------------------------------------
    // IERC721Receiver Implementation
    // -------------------------------------------------------------------------

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // -------------------------------------------------------------------------
    // Admin Functions
    // -------------------------------------------------------------------------

    function setFeePercentage(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee cannot exceed 10%");
        feePercentageBps = _newFeeBps;
        emit FeePercentageUpdated(_newFeeBps);
    }

    // -------------------------------------------------------------------------
    // Fixed Price Listing Functions
    // -------------------------------------------------------------------------

    /**
     * @notice Lists an NFT for a fixed price.
     */
    function listItem(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant returns (uint256) {
        require(_price > 0, "Price must be > 0");
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(_tokenId) == address(this),
            "Marketplace not approved"
        );

        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;

        listings[listingId] = Listing({
            listingId: listingId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            price: _price,
            status: ListingStatus.Active
        });

        activeListingId[_nftContract][_tokenId] = listingId;

        // Transfer NFT to marketplace for escrow
        nft.transferFrom(msg.sender, address(this), _tokenId);

        emit ItemListed(listingId, _nftContract, _tokenId, msg.sender, _price);
        return listingId;
    }

    /**
     * @notice Purchases a listed NFT with ETH.
     */
    function buyItem(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.status = ListingStatus.Sold;
        delete activeListingId[listing.nftContract][listing.tokenId];

        uint256 totalPrice = listing.price;
        uint256 fee = (totalPrice * feePercentageBps) / BPS_DENOMINATOR;

        // Check ERC2981 royalty
        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
            listing.nftContract,
            listing.tokenId,
            totalPrice
        );

        if (fee + royaltyAmount > totalPrice) {
            royaltyAmount = totalPrice > fee ? totalPrice - fee : 0;
        }

        uint256 sellerPayout = totalPrice - fee - royaltyAmount;

        // Pay fee, royalty, and seller safely
        if (fee > 0) {
            _safeTransferETH(owner(), fee);
        }
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            _safeTransferETH(royaltyReceiver, royaltyAmount);
        }
        _safeTransferETH(listing.seller, sellerPayout);

        // Refund excess ETH if paid more
        if (msg.value > totalPrice) {
            _safeTransferETH(msg.sender, msg.value - totalPrice);
        }

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        emit ItemSold(
            _listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            totalPrice
        );
    }

    /**
     * @notice Updates the price of an active listing.
     */
    function updateListingPrice(uint256 _listingId, uint256 _newPrice) external {
        Listing storage listing = listings[_listingId];
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.seller == msg.sender, "Not listing seller");
        require(_newPrice > 0, "Price must be > 0");

        listing.price = _newPrice;
        emit ListingPriceUpdated(_listingId, _newPrice);
    }

    /**
     * @notice Cancels an active listing and returns the NFT to seller.
     */
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");

        listing.status = ListingStatus.Canceled;
        delete activeListingId[listing.nftContract][listing.tokenId];

        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(address(this), listing.seller, listing.tokenId);

        emit ListingCanceled(_listingId);
    }

    // -------------------------------------------------------------------------
    // Timed Auction Functions
    // -------------------------------------------------------------------------

    /**
     * @notice Creates an English auction for an NFT.
     */
    function createAuction(
        address _nftContract,
        uint256 _tokenId,
        uint256 _minPrice,
        uint256 _durationSeconds
    ) external nonReentrant returns (uint256) {
        require(_minPrice > 0, "Min price must be > 0");
        require(_durationSeconds >= 60, "Duration must be at least 1 min");

        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(_tokenId) == address(this),
            "Marketplace not approved"
        );

        _auctionIdCounter++;
        uint256 auctionId = _auctionIdCounter;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            minPrice: _minPrice,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: block.timestamp + _durationSeconds,
            status: AuctionStatus.Active
        });

        activeAuctionId[_nftContract][_tokenId] = auctionId;

        // Escrow NFT
        nft.transferFrom(msg.sender, address(this), _tokenId);

        emit AuctionCreated(
            auctionId,
            _nftContract,
            _tokenId,
            msg.sender,
            _minPrice,
            _durationSeconds
        );
        return auctionId;
    }

    /**
     * @notice Places a bid on an active auction.
     */
    function placeBid(uint256 _auctionId) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");

        uint256 minRequiredBid = auction.highestBid == 0
            ? auction.minPrice
            : auction.highestBid + (auction.highestBid * 5 / 100); // 5% minimum bid increment

        require(msg.value >= minRequiredBid, "Bid too low");

        address previousHighestBidder = auction.highestBidder;
        uint256 previousHighestBid = auction.highestBid;

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        // Refund previous bidder immediately
        if (previousHighestBidder != address(0) && previousHighestBid > 0) {
            _safeTransferETH(previousHighestBidder, previousHighestBid);
        }

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    /**
     * @notice Finalizes an auction after expiration.
     */
    function endAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");

        auction.status = AuctionStatus.Ended;
        delete activeAuctionId[auction.nftContract][auction.tokenId];

        if (auction.highestBidder != address(0)) {
            uint256 winningBid = auction.highestBid;
            uint256 fee = (winningBid * feePercentageBps) / BPS_DENOMINATOR;

            (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
                auction.nftContract,
                auction.tokenId,
                winningBid
            );

            if (fee + royaltyAmount > winningBid) {
                royaltyAmount = winningBid > fee ? winningBid - fee : 0;
            }

            uint256 sellerPayout = winningBid - fee - royaltyAmount;

            if (fee > 0) {
                _safeTransferETH(owner(), fee);
            }
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                _safeTransferETH(royaltyReceiver, royaltyAmount);
            }
            _safeTransferETH(auction.seller, sellerPayout);

            // Transfer NFT to winner
            IERC721(auction.nftContract).safeTransferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );

            emit AuctionEnded(_auctionId, auction.highestBidder, winningBid);
        } else {
            // No bids placed: return NFT to seller
            IERC721(auction.nftContract).safeTransferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );

            emit AuctionEnded(_auctionId, address(0), 0);
        }
    }

    /**
     * @notice Cancels an auction if no bids have been placed yet.
     */
    function cancelAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(auction.seller == msg.sender || msg.sender == owner(), "Not authorized");
        require(auction.highestBidder == address(0), "Cannot cancel active bids");

        auction.status = AuctionStatus.Canceled;
        delete activeAuctionId[auction.nftContract][auction.tokenId];

        IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenId);

        emit AuctionCanceled(_auctionId);
    }

    // -------------------------------------------------------------------------
    // Direct Offer System Functions
    // -------------------------------------------------------------------------

    /**
     * @notice Places a direct ETH offer on any NFT token.
     */
    function makeOffer(address _nftContract, uint256 _tokenId)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        require(msg.value > 0, "Offer price must be > 0");

        _offerIdCounter++;
        uint256 offerId = _offerIdCounter;

        offers[offerId] = Offer({
            offerId: offerId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            offeror: msg.sender,
            offerPrice: msg.value,
            status: OfferStatus.Pending
        });

        emit OfferMade(offerId, _nftContract, _tokenId, msg.sender, msg.value);
        return offerId;
    }

    /**
     * @notice Cancels a pending offer and refunds locked ETH.
     */
    function cancelOffer(uint256 _offerId) external nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.Pending, "Offer not pending");
        require(offer.offeror == msg.sender, "Not offeror");

        offer.status = OfferStatus.Canceled;
        uint256 refundAmount = offer.offerPrice;
        offer.offerPrice = 0;

        _safeTransferETH(msg.sender, refundAmount);

        emit OfferCanceled(_offerId);
    }

    /**
     * @notice Accepts a pending offer for an NFT token.
     */
    function acceptOffer(uint256 _offerId) external nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.Pending, "Offer not pending");

        IERC721 nft = IERC721(offer.nftContract);
        address tokenOwner = nft.ownerOf(offer.tokenId);

        bool isEscrowedInMarketplace = (tokenOwner == address(this));
        address actualSeller;

        if (isEscrowedInMarketplace) {
            uint256 listingId = activeListingId[offer.nftContract][offer.tokenId];
            uint256 auctionId = activeAuctionId[offer.nftContract][offer.tokenId];

            if (listingId != 0 && listings[listingId].status == ListingStatus.Active) {
                actualSeller = listings[listingId].seller;
                listings[listingId].status = ListingStatus.Canceled;
                delete activeListingId[offer.nftContract][offer.tokenId];
            } else if (auctionId != 0 && auctions[auctionId].status == AuctionStatus.Active) {
                require(auctions[auctionId].highestBidder == address(0), "Cannot accept offer with active bids");
                actualSeller = auctions[auctionId].seller;
                auctions[auctionId].status = AuctionStatus.Canceled;
                delete activeAuctionId[offer.nftContract][offer.tokenId];
            } else {
                revert("Invalid escrow state");
            }
        } else {
            actualSeller = tokenOwner;
        }

        require(actualSeller == msg.sender, "Not NFT owner");

        offer.status = OfferStatus.Accepted;

        uint256 offerPrice = offer.offerPrice;
        uint256 fee = (offerPrice * feePercentageBps) / BPS_DENOMINATOR;

        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
            offer.nftContract,
            offer.tokenId,
            offerPrice
        );

        if (fee + royaltyAmount > offerPrice) {
            royaltyAmount = offerPrice > fee ? offerPrice - fee : 0;
        }

        uint256 sellerPayout = offerPrice - fee - royaltyAmount;

        if (fee > 0) {
            _safeTransferETH(owner(), fee);
        }
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            _safeTransferETH(royaltyReceiver, royaltyAmount);
        }
        _safeTransferETH(msg.sender, sellerPayout);

        // Transfer NFT to offeror
        if (isEscrowedInMarketplace) {
            nft.safeTransferFrom(address(this), offer.offeror, offer.tokenId);
        } else {
            nft.safeTransferFrom(msg.sender, offer.offeror, offer.tokenId);
        }

        emit OfferAccepted(_offerId, msg.sender, offer.offeror, offerPrice);
    }

    // -------------------------------------------------------------------------
    // Internal Helper Functions
    // -------------------------------------------------------------------------

    function _safeTransferETH(address recipient, uint256 amount) internal {
        if (amount > 0 && recipient != address(0)) {
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "ETH transfer failed");
        }
    }

    function _getRoyaltyInfo(
        address _nftContract,
        uint256 _tokenId,
        uint256 _salePrice
    ) internal view returns (address receiver, uint256 royaltyAmount) {
        if (IERC165(_nftContract).supportsInterface(type(IERC2981).interfaceId)) {
            try IERC2981(_nftContract).royaltyInfo(_tokenId, _salePrice) returns (
                address _receiver,
                uint256 _royaltyAmount
            ) {
                return (_receiver, _royaltyAmount);
            } catch {
                return (address(0), 0);
            }
        }
        return (address(0), 0);
    }

    // Support receiving ETH
    receive() external payable {}
}
