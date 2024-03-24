import {NextRequest, NextResponse} from "next/server";
import {ImageResponse} from "next/og";
import {MdVerified} from "react-icons/md";
import {join} from "path";
import * as fs from "fs";
import {AuctionVaultABI} from "@/app/constants/ABI";
import {polygonMumbai} from "viem/chains";
import {createPublicClient, http} from "viem";
import request, {gql} from "graphql-request";

const interBoldPath = join(process.cwd(), "public/Inter-Bold.ttf");
let interBold = fs.readFileSync(interBoldPath);
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const auction = searchParams.get("auction");
  console.log(auction);
  const publicClient = createPublicClient({
    chain: polygonMumbai,
    transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
  });

  const auctionData: any = await publicClient.readContract({
    address: auction as `0xString`,
    abi: AuctionVaultABI,
    functionName: "getAuctionInfo",
  });

  const options = {method: "GET", headers: {accept: "application/json"}};

  const endpoint = "https://polygon-mumbai.subgraph.x.superfluid.dev/";
  const query = gql`
    query incomingStreamsQuery {
      streams(where: {receiver: "0x262F026D3d2a2Bb19E787Fc7669E86555A5a3AAE"}) {
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

  const data: any = await request(endpoint, query);
  console.log(
    `https://polygon-mumbai.g.alchemy.com/nft/v3/1ObE0PIpsFlEXG3NQCsRkNM8K5vAL8rP/getNFTMetadata?contractAddress=${auctionData[1].toString()}&tokenId=${auctionData[2].toString()}&refreshCache=false`
  );
  const nftMeta = await fetch(
    `https://polygon-mumbai.g.alchemy.com/nft/v3/1ObE0PIpsFlEXG3NQCsRkNM8K5vAL8rP/getNFTMetadata?contractAddress=${auctionData[1].toString()}&tokenId=${auctionData[2].toString()}&refreshCache=false`,
    options
  );

  const response = await nftMeta.json();

  console.log(response);

  const {
    name,
    image: {cachedUrl},
  } = response;
  console.log(name, cachedUrl);

  return new ImageResponse(
    (
      <div
        style={{
          color: "white",
          display: "flex",
          width: "100%",
          height: "100%",

          justifyContent: "center",
          padding: "20px 0",
          alignItems: "center",
          backgroundColor: "black",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p style={{color: "#e03dc1", fontSize: "70px"}}>AuctionNFT: {name}</p>
          <img
            src={cachedUrl}
            alt=""
            height={"70%"}
            style={{borderRadius: "40px"}}
          />

          <p
            style={{
              fontSize: "30px",
            }}
          >
            Start a mumbai fDAIx Stream to bid. max bidder wins!
          </p>
          <p
            style={{
              fontSize: "30px",
            }}
          >
            Total Stream Bidders: {data.streams.length}
          </p>
        </div>
      </div>
    ),
    {
      width: 1528, // Match these dimensions to your image's dimensions
      height: 800,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          weight: 800,
          style: "normal",
        },
      ],
    }
  );
}

export const POST = GET;
