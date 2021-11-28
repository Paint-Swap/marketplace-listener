import React, { useEffect } from "react";
import { ethers } from "ethers"
// import { MarketplaceV2 } from "@paintswap/marketplace-interactions"
// import { Sold, NewListing, Unsold, BundlePriceUpdate, DurationExtended, NewBid, NewOffer } from "@paintswap/marketplace-interactions/dist/lib/marketplaceV2Types";
// import { MarketplaceV2 } from '../dist/lib'
// import { Sold, NewListing, Unsold, BundlePriceUpdate, DurationExtended, NewBid, NewOffer } from '../dist/lib/marketplaceV2Types'
import { MarketplaceV2 } from '../lib'
import { Sold, NewListing, Unsold, BundlePriceUpdate, DurationExtended, NewBid, NewOffer } from '../lib/marketplaceV2Types'
import styled from 'styled-components'
import { short, getBalanceNumber, timeConverter } from '../utils/helpers'
import ChartCard from "./ChartCard";

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ftm.tools/"
)

const mainUrl = 'https://paintswap.finance/marketplace/'

interface UnsoldExtended extends Unsold {
  cancelled: boolean
}

const marketplace = new MarketplaceV2(provider)

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  xxl: 2560,
}

const mediaQueries = {
  xs: `@media screen and (min-width: ${breakpoints.xs}px)`,
  sm: `@media screen and (min-width: ${breakpoints.sm}px)`,
  md: `@media screen and (min-width: ${breakpoints.md}px)`,
  lg: `@media screen and (min-width: ${breakpoints.lg}px)`,
  xl: `@media screen and (min-width: ${breakpoints.xl}px)`,
  xxl: `@media screen and (min-width: ${breakpoints.xxl}px)`,
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`

// Determines the amount of columns for the stat grid
const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  grid-gap: 60px;
  width: 100%;

  ${mediaQueries.sm} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaQueries.md} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  ${mediaQueries.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  ${mediaQueries.xl} {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  ${mediaQueries.xxl} {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 100%;
  background-color: #131318;
  border-radius: 20px;
  padding-bottom: 24px;
`

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  overflow-y: visible;
  height: 600px;
`

const FeedSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  margin-left: 24px;
  margin-right: 24px;
`

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 8px;
`

const SpanHeader = styled.span`
  margin-top: 16px;
  font-size: 18px;
  font-weight: bold;
`
const SpanMain = styled.span`
  font-size: 14px;
  color: #7d8fd1;
`

const Divider = styled.div`
  margin-top: 16px;
  height: 1px;
  width: 100%;
  background-color: #7d8fd1;
  opacity: 0.3;
`

const EventPrinter = () => {
  const [listingFeed, setListingFeed] = React.useState<Array<NewListing>>([])
  const [soldFeed, setSoldFeed] = React.useState<Array<Sold>>([])
  const [unsoldFeed, setUnsoldFeed] = React.useState<Array<UnsoldExtended>>([])
  const [priceUpdateFeed, setPriceUpdateFeed] = React.useState<Array<BundlePriceUpdate>>([])
  const [durationExtendedFeed, setDurationExtendedFeed] = React.useState<Array<DurationExtended>>([])
  const [bidFeed, setBidFeed] = React.useState<Array<NewBid>>([])
  const [offerFeed, setOfferFeed] = React.useState<Array<NewOffer>>([])

  // For the chart
  const [chartVolumeTotal, setChartVolumeTotal] = React.useState(0)
  const [chartVolume, setChartVolume] = React.useState<Array<any>>([])

  useEffect(() => {
    console.log("Start listening")
    marketplace.onNewListing((item) => {
      console.log('New listing!\n', item)

      const feed: Array<NewListing> = listingFeed || []
      feed.unshift(item)
      setListingFeed([...feed])
    })
  
    marketplace.onSold((item) => {
      console.log('Sold!\n', item)

      const feed: Array<Sold> = soldFeed || []
      feed.unshift(item)
      setSoldFeed([...feed])

      const chartFeed = chartVolume || []
      chartFeed.push({
        time: timeConverter(Date.now() / 1000),
        volume: chartVolumeTotal + getBalanceNumber(item.priceTotal),
      })
      setChartVolumeTotal(chartVolumeTotal + getBalanceNumber(item.priceTotal))
      setChartVolume([...chartFeed])
    })

    marketplace.onUnsold((item, cancelled) => {
      const feed: Array<UnsoldExtended> = unsoldFeed || []
      
      if (cancelled) {
          console.log('Cancelled sale\n', item)
          const itemExt: UnsoldExtended = Object.assign({}, item, {cancelled: true});
          feed.unshift(itemExt)
      }
      else {
          console.log('Failed to sell\n', item)
          const itemExt: UnsoldExtended = Object.assign({}, item, {cancelled: false});
          feed.unshift(itemExt)
      }
      setUnsoldFeed([...feed])
    })

    marketplace.onPriceUpdate((item) => {
      console.log('Price updated\n', item)
  
      const feed: Array<BundlePriceUpdate> = priceUpdateFeed || []
      feed.unshift(item)
      setPriceUpdateFeed([...feed])
    })
  
    marketplace.onNewBid((bid) => {
      console.log('New bid\n', bid)

      const feed: Array<NewBid> = bidFeed || []
      feed.unshift(bid)
      setBidFeed([...feed])
    })
  
    marketplace.onNewOffer((offer) => {
      console.log('New offer\n', offer)

      const feed: Array<NewOffer> = offerFeed || []
      feed.unshift(offer)
      setOfferFeed([...feed])
    })

    marketplace.onDurationExtended((extension) => {
      console.log('Auction duration extended\n', extension)

      const feed: Array<DurationExtended> = durationExtendedFeed || []
      feed.unshift(extension)
      setDurationExtendedFeed([...feed])
    })
  }, [])

  return (
    <Body>
      <ListContainer>
        {/** LISTINGS */}
        <FeedContainer>
          <p>LISTINGS</p>
          <Feed>
            {listingFeed && listingFeed.map((item: NewListing, index: number) => (
                <FeedSection key={index}>
                  <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                  <SectionRow>
                    <SpanMain>Collection</SpanMain>
                    <SpanMain><a href={`${mainUrl}collections/${item.collection.toLowerCase()}`} target="_blank">{short(item.collection.toLowerCase())}</a></SpanMain>
                  </SectionRow>
                  <SectionRow>
                    <SpanMain>Token ID</SpanMain>
                    <SpanMain><a href={`${mainUrl}assets/${item.collection.toLowerCase()}/${item.tokenID.toString()}`} target="_blank">{item.tokenID.toString()}</a></SpanMain>
                  </SectionRow>
                  <SectionRow>
                    <SpanMain>Type</SpanMain>
                    <SpanMain>{item.isAuction ? 'Auction' : 'Sale'}</SpanMain>
                  </SectionRow>
                  <SectionRow>
                    <SpanMain>Duration</SpanMain>
                    <SpanMain>{`${item.duration.toNumber() / 3600}h`}</SpanMain>
                  </SectionRow>
                  <SectionRow>
                    <SpanMain>Amount</SpanMain>
                    <SpanMain>{item.amount.toString()}</SpanMain>
                  </SectionRow>
                  <SectionRow>
                    <SpanMain>Unit Price</SpanMain>
                    <SpanMain>{getBalanceNumber(item.pricePerUnit)}</SpanMain>
                  </SectionRow>
                  <SectionRow>
                    <SpanMain>Total Price</SpanMain>
                    <SpanMain>{getBalanceNumber(item.priceTotal)}</SpanMain>
                  </SectionRow>
                  <Divider/>
                </FeedSection>
            ))}
            {!listingFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>

        {/** SOLD */}
        <FeedContainer>
        <p>SOLD</p>
          <Feed>
            {soldFeed && soldFeed.map((item: Sold, index: number) => (
              <FeedSection key={index}>
                <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                <SectionRow>
                  <SpanMain>Collection</SpanMain>
                  <SpanMain><a href={`${mainUrl}collections/${item.collection.toLowerCase()}`} target="_blank">{short(item.collection.toLowerCase())}</a></SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Token ID</SpanMain>
                  <SpanMain><a href={`${mainUrl}assets/${item.collection.toLowerCase()}/${item.tokenID.toString()}`} target="_blank">{item.tokenID.toString()}</a></SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Amount</SpanMain>
                  <SpanMain>{item.amount.toString()}</SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Unit Price</SpanMain>
                  <SpanMain>{getBalanceNumber(item.pricePerUnit)}</SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Total Price</SpanMain>
                  <SpanMain>{getBalanceNumber(item.priceTotal)}</SpanMain>
                </SectionRow>
                <Divider/>
              </FeedSection>
            ))}
            {!soldFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>

        {/** UNSOLD */}
        <FeedContainer>
          <p>UNSOLD</p>
          <Feed>
            {unsoldFeed && unsoldFeed.map((item: UnsoldExtended, index: number) => (
              <FeedSection key={index}>
                <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                <SectionRow>
                  <SpanMain>Reason</SpanMain>
                  <SpanMain>{item.cancelled ? 'Cancelled' : 'Expired'}</SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Collection</SpanMain>
                  <SpanMain><a href={`${mainUrl}collections/${item.collection.toLowerCase()}`} target="_blank">{short(item.collection.toLowerCase())}</a></SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Token ID</SpanMain>
                  <SpanMain><a href={`${mainUrl}assets/${item.collection.toLowerCase()}/${item.tokenID.toString()}`} target="_blank">{item.tokenID.toString()}</a></SpanMain>
                </SectionRow>
                <Divider/>
              </FeedSection>
            ))}
            {!unsoldFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>

        {/** PRICE UPDATE */}
        <FeedContainer>
        <p>PRICE UPDATES</p>
          <Feed>
            {priceUpdateFeed && priceUpdateFeed.map((item: BundlePriceUpdate, index: number) => (
              <FeedSection key={index}>
                <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                <SectionRow>
                  <SpanMain>New Price</SpanMain>
                  <SpanMain>{getBalanceNumber(item.price)}</SpanMain>
                </SectionRow>
                <Divider/>
              </FeedSection>
            ))}
            {!priceUpdateFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>

        {/** BIDS */}
        <FeedContainer>
        <p>BIDS</p>
          <Feed>
            {bidFeed && bidFeed.map((item: NewBid, index: number) => (
              <FeedSection key={index}>
                <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                <SectionRow>
                  <SpanMain>Bidder</SpanMain>
                  <SpanMain><a href={`${mainUrl}user/${item.bidder.toLowerCase()}`} target="_blank">{short(item.bidder)}</a></SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Bid</SpanMain>
                  <SpanMain>{getBalanceNumber(item.bid)}</SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Next Minimum</SpanMain>
                  <SpanMain>{getBalanceNumber(item.nextMinimum)}</SpanMain>
                </SectionRow>
                <Divider/>
              </FeedSection>
            ))}
            {!bidFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>

        {/** OFFERS */}
        <FeedContainer>
        <p>OFFERS</p>
          <Feed>
            {offerFeed && offerFeed.map((item: NewOffer, index: number) => (
              <FeedSection key={index}>
                <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                <SectionRow>
                  <SpanMain>Offerer</SpanMain>
                  <SpanMain><a href={`${mainUrl}user/${item.offerrer.toLowerCase()}`} target="_blank">{short(item.offerrer)}</a></SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Offer</SpanMain>
                  <SpanMain>{getBalanceNumber(item.offer)}</SpanMain>
                </SectionRow>
                <SectionRow>
                  <SpanMain>Next Minimum</SpanMain>
                  <SpanMain>{getBalanceNumber(item.nextMinimum)}</SpanMain>
                </SectionRow>
                <Divider/>
              </FeedSection>
            ))}
            {!offerFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>

        {/** AUCTIONS EXTENDED */}
        <FeedContainer>
        <p>AUCTIONS EXTENDED</p>
          <Feed>
            {durationExtendedFeed && durationExtendedFeed.map((item: DurationExtended, index: number) => (
              <FeedSection key={index}>
                <SpanHeader>ID: <a href={`${mainUrl}${item.marketplaceId.toString()}`} target="_blank">{item.marketplaceId.toString()}</a></SpanHeader>
                <SectionRow>
                  <SpanMain>End Time</SpanMain>
                  <SpanMain>{timeConverter(item.endTime.toNumber())}</SpanMain>
                </SectionRow>
                <Divider/>
              </FeedSection>
            ))}
            {!durationExtendedFeed.length && (
              <SpanHeader>Waiting for events...</SpanHeader>
            )}
          </Feed>
        </FeedContainer>
      </ListContainer>
      <ChartCard volume={chartVolume} />
    </Body>
  )
}

export default EventPrinter