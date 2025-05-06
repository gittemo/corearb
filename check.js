import fs from 'fs'
import { info } from './hl.js'

const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
const ctx = await info("spotMetaAndAssetCtxs")

function getPrice(token) {
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
      console.log(`${pool.baseToken.symbol}/${pool.quoteToken.symbol} ${pool.priceNative} ${liq}`)
      // console.log(pool.priceUsd)
      const price = pool.baseToken.address.toLowerCase() !== address ? 1 / pool.priceNative : pool.priceUsd;
      // console.log(`    ${pool.dexId}: Price: ${price}, Liq: ${liq}`);
    }
}
const t1 = "UETH"
const t2 = "UBTC"

const base = getPrice(tokens[t1])
const quote = getPrice(tokens[t2])

console.log(`${t1}/${t2} ${(base/quote).toFixed(20)}`)
await check(t1, t2)
