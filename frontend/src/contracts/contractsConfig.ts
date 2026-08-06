export const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Local Anvil default
export const NFT_COLLECTION_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const MARKETPLACE_ABI = [
  "function listItem(address _nftContract, uint256 _tokenId, uint256 _price) external returns (uint256)",
  "function buyItem(uint256 _listingId) external payable",
  "function updateListingPrice(uint256 _listingId, uint256 _newPrice) external",
  "function cancelListing(uint256 _listingId) external",
  "function createAuction(address _nftContract, uint256 _tokenId, uint256 _minPrice, uint256 _durationSeconds) external returns (uint256)",
  "function placeBid(uint256 _auctionId) external payable",
  "function endAuction(uint256 _auctionId) external",
  "function cancelAuction(uint256 _auctionId) external",
  "function makeOffer(address _nftContract, uint256 _tokenId) external payable returns (uint256)",
  "function cancelOffer(uint256 _offerId) external",
  "function acceptOffer(uint256 _offerId) external",
  "function feePercentageBps() external view returns (uint256)",
  "function listings(uint256) external view returns (uint256 listingId, address nftContract, uint256 tokenId, address seller, uint256 price, uint8 status)",
  "function auctions(uint256) external view returns (uint256 auctionId, address nftContract, uint256 tokenId, address seller, uint256 minPrice, uint256 highestBid, address highestBidder, uint256 startTime, uint256 endTime, uint8 status)",
  "function offers(uint256) external view returns (uint256 offerId, address nftContract, uint256 tokenId, address offeror, uint256 offerPrice, uint8 status)",
  "event ItemListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price)",
  "event ItemSold(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 minPrice, uint256 duration)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event OfferMade(uint256 indexed offerId, address indexed nftContract, uint256 indexed tokenId, address offeror, uint256 offerPrice)"
];

export const NFT_COLLECTION_ABI = [
  "function mintToken(string memory _tokenURI, uint96 royaltyBps) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function getApproved(uint256 tokenId) external view returns (address)"
];
