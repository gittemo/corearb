import fs from 'fs'
import { info } from './hl.js'

// FEUSD & USDXL
const stables = ["0xca79db4b49f608ef54a5cb813fbed3a6387bc645", "0x02c6a2fa58cc01a18b8d9e00ea48d65e4df26c70"];
// uBTC and uETH
const unit = ["0xbe6727b535545c67d5caa73dea54865b92cf7907", "0x9fdbda0a5e284c32744d2f17ee5c74b284993463"]

async function check() {
  const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));

  const ctx = await info("spotMetaAndAssetCtxs")

  for (const token of tokens) {
    const address = token.evmContract.address;

    if (stables.includes(address)) {
      continue;
    }

    if (!unit.includes(address)) {
      continue;
    }

    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/hyperevm/${address}`)
    const body = await response.json()
    if (!body || !body.length) {
      // console.log(`No pools for ${token.name} ${address}`);
      continue;
    }
    const pools = body.filter(pool => pool.liquidity && pool.liquidity.usd > 10000);

    const coreData = ctx[1].find(data => data.coin === token.universeName);
    const markPx = coreData.markPx;
    console.log(`${token.name} Spot ${coreData.markPx}`)
    for (const pool of pools) {
      // console.log(pool)
      const liq = `${Math.floor(pool.liquidity.usd / 1000)}k`;
      console.log(`${pool.baseToken.symbol}-${pool.quoteToken.symbol} ${liq} `)
      // if (pool.baseToken.address.toLowerCase() !== address) {
      //   continue;
      // }
      const price = pool.baseToken.address.toLowerCase() !== address ? 1 / pool.priceNative : pool.priceUsd;
      // console.log(`    ${pool.dexId}: Price: ${price}, Liq: ${liq}`);
    }
  }
}

await check()