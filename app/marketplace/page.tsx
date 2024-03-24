"use client";
import React, {useEffect, useState} from "react";
import {useReadContract} from "wagmi";
import {AuctioneerXABI} from "../constants/ABI";
import {AuctioneerXAddress} from "../constants/Address";
import AuctionCard from "../components/AuctionCard";

const Marketplace = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const {data} = useReadContract({
    abi: AuctioneerXABI,
    address: AuctioneerXAddress,
    functionName: "getAllAuctions",
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

export default Marketplace;
