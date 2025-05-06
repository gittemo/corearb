import fs from 'fs'
import { info, getPools } from './api.js'
import { get } from 'http';

const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
const ctx = await info("spotMetaAndAssetCtxs")
const prices = {}

function getL1Price(t1Un, t2Un) {
  const token1Ctx = ctx[1].find(data => data.coin === t1Un);
  const token2Ctx = ctx[1].find(data => data.coin === t2Un);

  return (token1Ctx.markPx / token2Ctx.markPx).toFixed(10);
}

async function check(token1, token2, middleToken) {
  const pools1 = await getPools(token1)
  const pools2 = await getPools(middleToken)
  for (const pool of pools1) {
    const liq = `${Math.floor(pool.liquidity.usd / 1000)}k`;
    if (pool.token2 === token2.name) {
      prices[`${pool.dexId}/${liq}/${pool.token2}`] = pool.priceNative;
    } else if (pool.token2 === middleToken.name) {
      for (const pool2 of pools2) {
        const liq2 = `${Math.floor(pool2.liquidity.usd / 1000)}k`;
        if (pool2.token2 === token2.name) {
          prices[`${pool.dexId}/${liq}/${pool2.dexId}/${liq2}/${pool2.token2}`] = pool.priceNative * pool2.priceNative;
        } else if (pool2.token2 === token1.name) {
          prices[`${pool.dexId}/${liq}/${pool2.dexId}/${liq2}/${pool.token2}`] = pool.priceNative / pool2.priceNative;
        }
      }
      prices[`${pool.dexId}/${liq}/${pool.token2}`] = pool.priceNative;
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
prices.L1 = getL1Price(token1.universeName, token2.universeName);

await check(token1, token2, middleToken);
console.log(`\n${token1.name}/${token2.name}`);
for (const [key, value] of Object.entries(prices)) {
  const price = parseFloat(value).toFixed(10);
  console.log(`${price} ${key}`);
}
