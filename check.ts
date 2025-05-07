import fs from 'fs'
import { info, getPools } from './api.ts'
import { liqFmt } from './fmt.ts';

const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
const ctx = await info("spotMetaAndAssetCtxs")

type Hop = {
  dex: string;
  liq: string;
  token2: string;
  priceNative: number;
}

type Opportunity = {
  route: Hop[];
  price: number;
}

const opps: Opportunity[] = []

function getL1Price(t1Un, t2Un) {
  const token1Ctx = ctx[1].find(data => data.coin === t1Un);
  const token2Ctx = ctx[1].find(data => data.coin === t2Un);

  return (token1Ctx.markPx / token2Ctx.markPx).toFixed(10);
}

async function check(token1, token2, middleToken) {
  const pools1 = await getPools(token1)
  const pools2 = await getPools(middleToken)
  for (const pool of pools1) {
    const liq = liqFmt(pool.liquidity.usd);
    if (pool.token2 === token2.name) {
      opps.push({ route: [{ dex: pool.dexId, liq, token2: pool.token2, priceNative: pool.priceNative }], price: pool.priceNative });
    } else if (pool.token2 === middleToken.name) {
      for (const pool2 of pools2) {
        if (pool2.token2 !== token2.name) continue;
        const liq2 = liqFmt(pool2.liquidity.usd);
        opps.push({ route: [`${pool.dexId}/${liq}/${pool.token2}`, `${pool2.dexId}/${liq2}/${pool2.token2}`], price: pool.priceNative * pool2.priceNative });
      }
    }
  }
}

const token1 = tokens.UETH;
const token2 = tokens.UBTC;
const middleToken = { name: "WHYPE", address: "0x5555555555555555555555555555555555555555" };
// const middleToken = token1;
// const middleTokenPools = await getPools(middleToken);
// for (const pool of middleTokenPools) {
//   console.log(pool.token2, pool.baseToken.symbol === middleToken.name ? pool.quoteToken.address : pool.baseToken.address)
//   console.log(pool.pairAddress)
// }
opps.push({ route: "L1", price: getL1Price(token1.universeName, token2.universeName) })

await check(token1, token2, middleToken);
console.log(`\n${token1.name}/${token2.name}`);
for (const opp of opps) {
  console.log(`${opp.price} ${opp.route}`);
}
