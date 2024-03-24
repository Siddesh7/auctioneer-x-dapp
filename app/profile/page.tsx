"use client";
import React, {useEffect, useState} from "react";
import {AuctioneerXABI, AuctionVaultABI} from "../constants/ABI";
import {AuctioneerXAddress} from "../constants/Address";
import {useAccount, useReadContract} from "wagmi";
import AuctionCard from "../components/AuctionCard";

const Profile = () => {
  const {address} = useAccount();
  const [auctions, setAuctions] = useState<any[]>([]);
  const {data} = useReadContract({
    abi: AuctioneerXABI,
    address: AuctioneerXAddress,
    functionName: "getAuctionsByOwner",
    args: [address],
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      setAuctions(data as any[]);
    }
  }, [data]);
  return (
    <div>
      {auctions.map((auction) => {
        return (
          <div key={auction.toString()} className="p-4 flex flex-row flex-wrap">
            <AuctionCard address={auction.toString()} />
          </div>
        );
      })}
    </div>
  );
};

export default Profile;
