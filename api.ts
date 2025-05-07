export async function info(type) {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type })
  });
  return await response.json();
}

export async function getPools(token) {
  const name = token.name
  const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/hyperevm/${token.address}`);
  const body = await response.json();
  if (!body || !body.length) {
    return; // no pools found
  }
  return body.map(pool => {
    const token2 = pool.baseToken.symbol === name ? pool.quoteToken : pool.baseToken;
    const priceNative = pool.baseToken.symbol === name ? pool.priceNative : 1 / pool.priceNative;
    const address = token2.address.toLowerCase()
    return {...pool, name, token2: {...token2, address}, priceNative};
  }).filter(pool => pool.liquidity.usd > 10000);
}
