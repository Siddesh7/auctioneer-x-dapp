"use client";
import React from "react";
import {useAccount, useReadContract, useWriteContract} from "wagmi";
import {AuctionVaultABI} from "../constants/ABI";
import {erc20Abi} from "viem";
import {ethers} from "ethers";
import {AuctioneerXAddress, FDAIX_ADDRESS} from "../constants/Address";
import {Framework} from "@superfluid-finance/sdk-core";
import {request, gql} from "graphql-request";
import {FaLink} from "react-icons/fa6";
const AuctionCard = ({address}: {address: `0x${string}`}) => {
  const [auction, setAuction] = React.useState<any[]>([]);
  const [winner, setWinner] = React.useState<string>("");
  const {writeContractAsync, data: hash} = useWriteContract();
  const [streams, setStreams] = React.useState<any[]>([]);
  const [streamBid, setStreamBid] = React.useState<string>("");
  const {address: connectedAddress} = useAccount();
  const bid = async () => {
    console.log("streamBid", streamBid);
  };
  const fetchGraphQLData = async () => {
    const endpoint = "https://polygon-mumbai.subgraph.x.superfluid.dev/";
    const query = gql`
      query incomingStreamsQuery {
        streams(
          where: {receiver: "0x262F026D3d2a2Bb19E787Fc7669E86555A5a3AAE"}
        ) {
          sender {
            id
            createdAtTimestamp
          }
          streamPeriods {
            flowRate
          }
        }
      }
    `;

    try {
      const data: any = await request(endpoint, query);
      setStreams(data?.streams);
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  //   const getTokenFlow = async () => {
  //     const sf = await Framework.create({
  //       chainId: 80001,
  //       provider: new ethers.providers.JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
  //       ),
  //     });
  //     console.log("sf", sf);
  //     const flowInfo = await sf.cfaV1.getNetFlow({
  //       superToken: FDAIX_ADDRESS,
  //       account: address,
  //       providerOrSigner: new ethers.providers.JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
  //       ),
  //     });
  //     console.log("flowInfo", flowInfo);
  //   };

  const {data} = useReadContract({
    abi: AuctionVaultABI,
    address: address,
    functionName: "getAuctionInfo",
  });
  const {data: balance} = useReadContract({
    abi: erc20Abi,
    address: FDAIX_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  React.useEffect(() => {
    if (data) {
      console.log(data);
      setAuction(data as any[]);
    }
  }, [data]);

  React.useEffect(() => {
    fetchGraphQLData();
  }, []);

  const settleAuction = async () => {
    if (streams.length === 0) {
      alert("no incoming bids");
      return;
    }
    const maxFlowRateObj = streams.reduce((prev, current) =>
      parseInt(current.streamPeriods[0].flowRate) >
      parseInt(prev.streamPeriods[0].flowRate)
        ? current
        : prev
    );

    const winnerAddress = maxFlowRateObj.sender.id;
    console.log("winnerAddress", winnerAddress);
    await writeContractAsync({
      abi: AuctionVaultABI,
      address: address,
      functionName: "settleAuction",
      args: [winnerAddress],
    });
  };
  const cancelAuction = async () => {
    await writeContractAsync({
      abi: AuctionVaultABI,
      address: address,
      functionName: "cancelAuction",
    });
  };

  return (
    <div className="card w-[48%] bg-white/40 text-primary-content">
      {auction.length > 0 && (
        <div className="card-body">
          <h2 className="card-title">
            Auction {auction[1].toString()}:{auction[2].toString()}
          </h2>
          <p className="text-lg font-medium">
            Balance: {Number(balance?.toString()) / 10 ** 18} fDAIx
          </p>
          <p className="text-lg font-medium">
            Totals Stream Bids: {streams.length}
          </p>
          <p className="text-lg font-medium flex flex-row gap-2 items-center">
            Share as a frame:{" "}
            <span
              className=" cursor-pointer"
              onClick={() =>
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_HOST}/marketplace/${address}`
                )
              }
            >
              <FaLink />
            </span>
          </p>
          {connectedAddress!.toLowerCase() === auction[0]?.toLowerCase() ? (
            <div className="card-actions w-full flex  flex-row gap-2">
              <button
                className="btn btn-primary w-[48%]"
                onClick={() => settleAuction()}
              >
                Settle Auction
              </button>

              <button
                onClick={cancelAuction}
                className="btn btn-primary w-[48%]"
              >
                Cancel Auction
              </button>
            </div>
          ) : (
            <div className="card-actions w-full flex  flex-row gap-2">
              <input
                type="text"
                className="input w-[48%] bg-white/40 input-bordered"
                value={streamBid}
                placeholder="Stream Bid, flowrate per day in fDAIx"
                onChange={(e) => {
                  setStreamBid(e.target.value);
                }}
              />

              <button onClick={bid} className="btn btn-primary w-[48%]">
                Stream Bid
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionCard;
