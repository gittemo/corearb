import fs from 'fs'
import { info } from './hl.js'

const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
const ctx = await info("spotMetaAndAssetCtxs")
const prices = {}

function getL1Price(token) {
  const coreData = ctx[1].find(data => data.coin === token.universeName);
  // console.log(`${token.name} Spot ${coreData.markPx}`)
  return coreData.markPx
}

async function check(base, quote) {
    const address = tokens[quote].evmContract.address;

    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/hyperevm/${address}`)
    const body = await response.json()
    if (!body || !body.length) {
      return; // no pools found
    }

    const pools = body.filter(pool => pool.liquidity && pool.liquidity.usd > 5000);

    for (const pool of pools) {
      if (pool.baseToken.symbol !== base) {
        continue;
      }

      const liq = `${Math.floor(pool.liquidity.usd / 1000)}k`;
      prices[`${pool.dexId}/${liq}`] = pool.priceNative
    }
}

const t1 = "BUDDY"
const t2 = "UBTC"

const base = getL1Price(tokens[t1])
const quote = getL1Price(tokens[t2])
prices.l1 = (base/quote).toFixed(10)

await check(t1, t2)
console.log(`\n${t1}/${t2}`)
console.log(prices)