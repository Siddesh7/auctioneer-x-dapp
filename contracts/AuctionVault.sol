pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionVault is Ownable {

    address payable public seller;

    // Information about the ERC721 asset being auctioned
    address public assetContract; // Address of the ERC721 contract
    uint256 public tokenId;       // Token ID of the auctioned asset

    // Auction parameters
    uint256 public minimumBid;   // Minimum acceptable bid, flowrate per second
    uint256 public startDate;    // Auction start date (timestamp in seconds)
    uint256 public endDate;      // Auction end date (timestamp in seconds)

    // Flag to indicate if the auction is active
    bool public isAuctionActive;

    IERC721 private _erc721;
    IERC20 private _erc20;
    
    // Event emitted when the auction is settled
    event AuctionSettled(address winner);

    // Event emitted when the auction is canceled
    event AuctionCanceled();

    constructor(
        address _assetContract,
        uint256 _tokenId,
        address acceptedSuperToken,
        uint256 _minimumBid,
        uint256 _startDate,
        uint256 _endDate,
        address _seller
    )Ownable(_seller)  {
        seller = payable(_seller);
        assetContract = _assetContract;
        tokenId = _tokenId;
        minimumBid = _minimumBid;
        startDate = _startDate;
        endDate = _endDate;
        isAuctionActive = true;

        // Ensure the contract has ownership of the ERC721 asset
        _erc721 = IERC721(assetContract);
        _erc20 = IERC20(acceptedSuperToken);
    }

    // Function to retrieve current auction information
   function getAuctionInfo() public view returns (
        address,
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        bool
    ) {
        return (
            seller,
            assetContract,
            tokenId,
            minimumBid,
            startDate,
            endDate,
          
            isAuctionActive
        );
    }

    // Function to settle the auction (can be called by the owner after the end date)
    function settleAuction(address _winner) public onlyOwner {
        // require(block.timestamp > endDate, "Auction has not yet ended");

        isAuctionActive = false;

        // Transfer the ERC721 asset to the highest bidder
        _erc721.safeTransferFrom(address(this), _winner, tokenId);

        // Transfer the highest bid amount to the seller
        _erc20.transfer(seller, _erc20.balanceOf(address(this)));

        emit AuctionSettled(_winner);
    }

    // Function to cancel the auction (can only be called by the seller)
    function cancelAuction() public onlyOwner {
        require(isAuctionActive, "Auction is not active");

        isAuctionActive = false;

        // Transfer the ERC721 asset back to the seller
        _erc721.safeTransferFrom(address(this), seller, tokenId);

        emit AuctionCanceled();
    }

    // Function to withdraw balance from the contract (onlyOwner)
    function withdrawBalance(uint256 _amountHeld, address _recipient) public onlyOwner {
        _erc20.transfer(_recipient, _amountHeld);
    }

    fallback() external payable { }
    receive() external payable { }
}



