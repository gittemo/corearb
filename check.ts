import fs from 'fs'
import { info, getPools } from './api.ts'
import { liqFmt, round, routeFmt } from './fmt.ts';

const tokens: { [tokenName: string]: Token } = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
const ctx = await info("spotMetaAndAssetCtxs")

const token1 = tokens.UETH;
const token2 = tokens.UBTC;
const middleToken = { name: "WHYPE", address: "0x5555555555555555555555555555555555555555" };

const l1Price = getL1Price(token1.universeName, token2.universeName)

type Token = {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract: {
    address: string;
    evm_extra_wei_decimals: number;
  };
  fullName: string;
  deployerTradingFeeShare: string;
  universeName: string;
  address: string;
}

type Hop = {
  dex: string;
  liq: number;
  token1: string;
  token2: string;
  price: number;
}

type Opportunity = {
  route: Hop[];
  total: number;
  change: number
}

const opps: Opportunity[] = []

function getL1Price(t1Un, t2Un) {
  const token1Ctx = ctx[1].find(data => data.coin === t1Un);
  const token2Ctx = ctx[1].find(data => data.coin === t2Un);

  return token1Ctx.markPx / token2Ctx.markPx
}

async function check(token1, token2, middleToken) {
  const pools1 = await getPools(token1)
  const pools2 = await getPools(middleToken)
  for (const pool of pools1) {
    if (pool.token2 === token2.name) {
      opps.push({
        total: pool.priceNative,
        change: change(pool.priceNative, l1Price),
        route: [{ dex: pool.dexId, liq: pool.liquidity.usd, token1: token1.name, token2: pool.token2, price: pool.priceNative }],
      });
    } else if (pool.token2 === middleToken.name) {
      for (const pool2 of pools2) {
        if (pool2.token2 !== token2.name) continue;
        opps.push({
          total: pool.priceNative * pool2.priceNative,
          change: change(pool.priceNative * pool2.priceNative, l1Price),
          route: [
            { dex: pool.dexId, liq: pool.liquidity.usd, token1: token1.name, token2: pool.token2, price: pool.priceNative },
            { dex: pool2.dexId, liq: pool2.liquidity.usd, token1: middleToken.name, token2: pool2.token2, price: pool2.priceNative },
          ],
        });
      }
    }
  }
}

await check(token1, token2, middleToken);
console.log(`found ${opps.length} paths`)
for (const opp of opps) {
  console.log(`\n${routeFmt(opp.route)}`)
  console.log(`Total: ${round(opp.total, 7)}\tChange: ${round(opp.change, 5)}%`);
}

function change(a, b) {
  return ((b - a) / a);
}
