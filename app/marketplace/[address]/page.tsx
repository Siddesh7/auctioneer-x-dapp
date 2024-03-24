import AuctionCard from "@/app/components/AuctionCard";
import React from "react";
import {Metadata} from "next";

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}/marketplace/${params.address}`;

  const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/image?auction=${params.address}`;
  return {
    title: "AuctioneerX",
    description: "Bid using Streams!",
    openGraph: {
      title: "AuctioneerX",
      images: [imageUrl],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:post_url": postUrl,
      "fc:frame:input:text": "FlowRate/day in fDAIx, 100",
      "fc:frame:button:1": "Stream Bid",
      "fc:frame:button:1:action": "tx",
      "fc:frame:button:1:target": "",
      of: "vNext",
      "of:image": imageUrl,
      "of:post_url": postUrl,
      "of:input:text": "FlowRate/day in fDAIx, 100",
      "of:button:1": "Stream Bid",
      "of:button:1:action": "tx",
      "of:button:1:target": `https://auctioner-x.vercel.app/api/bid/${params.address}`,
    },
  };
}
const Auction = ({params}: {params: any}) => {
  const address = params.address;

  return (
    <div className="p-4">
      <AuctionCard address={address} />
    </div>
  );
};

export default Auction;
