const fs = require('fs');

(async () => {
  const tokens = JSON.parse(fs.readFileSync('addies.json', 'utf-8'));

  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "spotMetaAndAssetCtxs" })
  });

  const ctx = await response.json();

  for (const token of tokens) {
    const address = token.evmContract.address;

    // Skip FEUSD & USDXL
    const stables = ["0xca79db4b49f608ef54a5cb813fbed3a6387bc645", "0x02c6a2fa58cc01a18b8d9e00ea48d65e4df26c70"];
    if (stables.includes(address)) {
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
    console.log(token.name, address)
    console.log(`    mark: ${coreData.markPx}, mid: ${coreData.midPx}`);
    for (const pool of pools) {
      if (pool.baseToken.address.toLowerCase() !== address) {
        continue;
      }
      const price = pool.baseToken.address.toLowerCase() !== address ? 1 / pool.priceNative : pool.priceUsd;
      const liq = pool.liquidity.usd;
      console.log(`    ${pool.dexId}: Price: ${price}, Liq: ${liq}`);
      if (price > markPx * 1.04 || price < markPx * 0.96) {
        // console.log(`    ${pool.dexId}: ${price}, Core: ${markPx}`);
        console.log(pool.url)
      }
    }
  }
})();
