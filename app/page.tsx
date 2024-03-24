"use client";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {useEffect, useState} from "react";
import {useAccount, useWriteContract} from "wagmi";
import {AuctioneerXAddress, FDAIX_ADDRESS} from "./constants/Address";
import {erc721Abi} from "viem";
import {AuctioneerXABI} from "./constants/ABI";
export default function Home() {
  const {address} = useAccount();
  const [NFTs, setNFTs] = useState<any[]>([]);
  const [selectedNft, setSelectedNFT] = useState<string>("");
  const [acceptedTokenAddress, setAcceptedTokenAddress] =
    useState<string>(FDAIX_ADDRESS);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const {writeContractAsync, data: info} = useWriteContract();
  const getNFTs = async () => {
    if (!address) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL}/getNFTsForOwner/?owner=${address}`
    );
    const resJson = await res.json();
    const ownedNFTs = resJson.ownedNfts;
    console.log("ownedNFTs", ownedNFTs);
    if (ownedNFTs.length > 0) {
      setSelectedNFT(
        ownedNFTs[0].contract.address + ":" + ownedNFTs[0].id.tokenId
      );
    }
    setNFTs(ownedNFTs);
  };
  const createAuction = async () => {
    if (!address) return;
    setLoading(true);
    console.log("Creating Auction");
    const [contractAddress, tokenId] = selectedNft.split(":");
    console.log({
      contractAddress,
      tokenId,
      acceptedTokenAddress,
      min: 1,
      startTime,
      endTime,
      address,
    });
    const hash = await writeContractAsync({
      abi: AuctioneerXABI,
      address: AuctioneerXAddress,
      functionName: "createAuctionVault",
      args: [
        contractAddress.toString(),
        tokenId.toString(),
        acceptedTokenAddress.toString(),
        "1",
        startTime.toString(),
        endTime.toString(),
      ],
    });
    console.log("hash", info);
    console.log("hash", hash);
    if (hash) window.location.href = `/profile`;
  };

  const approveToken = async () => {
    const hash = await writeContractAsync({
      abi: erc721Abi,
      address: selectedNft.split(":")[0] as `0x${string}`,
      functionName: "approve",
      args: [AuctioneerXAddress, selectedNft.split(":")[1] as any],
    });
    console.log("hash", hash);
    if (hash) setApproved(true);
  };
  useEffect(() => {
    getNFTs();
  }, [address]);

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="hero min-h-[90vh] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hey There Anon!</h1>
            <p className="py-6">
              Auction your NFT and raise money via Superfluid Streams. Highest
              bidder gets the NFT and bidders can stream in any amount of tokens
              they want. Using public available streaming value, bets can be
              made
            </p>
            <a href="#create">
              <button className="btn btn-primary"> Get Started</button>
            </a>
          </div>
        </div>
      </div>
      <div className="hero min-h-[90vh] bg-base-200" id="create">
        <div className="hero-content text-center">
          <div className="">
            <h1 className="text-5xl font-bold">Create you first Auction!</h1>
            <p className="py-6">
              Auction your NFT and raise money via Superfluid Streams. Highest
              bidder gets the NFT and bidders can stream in any amount of tokens
              they want. Using public available streaming value, bets can be
              made
            </p>
            <div className="max-w-lg m-auto text-left  bg-white/20 bg-opacity-25 rounded-xl p-4">
              <div className="flex flex-col py-4">
                <label htmlFor="nft" className="text-bold text-g mb-1">
                  Choose the NFT to raffle
                </label>

                <select
                  name="nft"
                  className="btn max-w-[100%] text-primary rounded-md p-2 text-left"
                  id="nft"
                  value={selectedNft}
                  onChange={(e) => setSelectedNFT(e.target.value)}
                  disabled={NFTs.length === 0}
                >
                  {NFTs.map((nft, index) => {
                    return (
                      <option
                        key={index}
                        value={`${nft.contract.address}:${nft.id.tokenId}`}
                      >
                        {nft.title ?? "null"}
                      </option>
                    );
                  })}
                </select>
                {NFTs.length === 0 && (
                  <p className="text-primary">You don&apos;t have any NFTs</p>
                )}
              </div>
              <div className="flex flex-col py-4">
                <label htmlFor="nft" className="text-bold text-g mb-1">
                  Payment Token
                </label>

                <select
                  name="nft"
                  className="btn max-w-[100%] text-primary bg-base-100 border-black border-2 rounded-md p-2 text-left"
                  id="nft"
                  value={acceptedTokenAddress}
                  onChange={(e) => setAcceptedTokenAddress(e.target.value)}
                >
                  {["FDAIX"].map((nft, index) => {
                    return (
                      <option key={index} value={FDAIX_ADDRESS}>
                        {nft}
                      </option>
                    );
                  })}
                </select>
                {NFTs.length === 0 && (
                  <p className="text-primary">You don&apos;t have any NFTs</p>
                )}
              </div>
              <div className="flex flex-col py-4 gap-4">
                <label
                  htmlFor="startDateTime"
                  className="text-bold text-g mb-1"
                >
                  Start Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  className="btn text-primary"
                  onChange={(e) =>
                    setStartTime(new Date(e.target.value).getTime() / 1000)
                  }
                />

                <label htmlFor="endDateTime" className="text-bold text-g mb-1">
                  End Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  className="btn text-primary"
                  onChange={(e) =>
                    setEndTime(new Date(e.target.value).getTime() / 1000)
                  }
                />
              </div>{" "}
              <button
                className="btn btn-secondary w-full my-2"
                onClick={approveToken}
              >
                Approve
              </button>
              <button
                className="btn btn-primary w-full my-2"
                onClick={createAuction}
                disabled={!approved}
              >
                {loading ? "Loading..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
