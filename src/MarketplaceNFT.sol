// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MarketplaceNFT
 * @notice ERC721 NFT Collection supporting metadata URIs and ERC-2981 royalties.
 */
contract MarketplaceNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string tokenURI,
        uint96 royaltyBps
    );

    constructor() ERC721("Apex Marketplace Collection", "APEX") Ownable(msg.sender) {}

    /**
     * @notice Mints a new NFT with metadata URI and optional royalty setting.
     * @param _tokenURI Metadata URI (e.g. IPFS or HTTPS URL).
     * @param royaltyBps Royalty percentage in basis points (e.g. 500 = 5%).
     * @return tokenId The ID of the newly minted NFT.
     */
    function mintToken(string memory _tokenURI, uint96 royaltyBps) external returns (uint256) {
        require(royaltyBps <= 1000, "Royalty cannot exceed 10%");
        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        if (royaltyBps > 0) {
            _setTokenRoyalty(newTokenId, msg.sender, royaltyBps);
        }

        emit NFTMinted(newTokenId, msg.sender, _tokenURI, royaltyBps);

        return newTokenId;
    }

    /// @dev Required override for ERC2981 and ERC721URIStorage interface support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
