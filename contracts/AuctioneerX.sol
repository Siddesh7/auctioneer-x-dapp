// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AuctionVault.sol";

contract AuctioneerX {
    event AuctionVaultCreated(address indexed owner, address indexed vault);

    mapping(address => address[]) public auctionsByOwner; // Map owner address to their auctions
    address[] public allAuctions; // Array to store all created auction contracts

    function createAuctionVault(
        address _assetContract,
        uint256 _tokenId,
        address _acceptedSuperToken,
        uint256 _minimumBid,
        uint256 _startDate,
        uint256 _endDate
    ) external returns (address) {
        // Deploy the AuctionVault contract
        AuctionVault newVault = new AuctionVault(
            _assetContract,
            _tokenId,
            _acceptedSuperToken,
            _minimumBid,
            _startDate,
            _endDate,
            msg.sender
        );

        // Transfer the NFT to the new AuctionVault contract
        IERC721(_assetContract).transferFrom(msg.sender, address(newVault), _tokenId);

        // Store the address of the newly created AuctionVault
        auctionsByOwner[msg.sender].push(address(newVault));
        allAuctions.push(address(newVault));

        // Emit event
        emit AuctionVaultCreated(msg.sender, address(newVault));

        return address(newVault);
    }

    function getAuctionsByOwner(address _owner) external view returns (address[] memory) {
        return auctionsByOwner[_owner];
    }

    function getAllAuctions() external view returns (address[] memory) {
        return allAuctions;
    }
}
