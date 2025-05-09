import fs from 'fs'
import { getPools } from './api';

const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));

// FEUSD & USDXL
const stables = ["0xca79db4b49f608ef54a5cb813fbed3a6387bc645", "0x02c6a2fa58cc01a18b8d9e00ea48d65e4df26c70"];

// uBTC and uETH
const unit = ["0xbe6727b535545c67d5caa73dea54865b92cf7907", "0x9fdbda0a5e284c32744d2f17ee5c74b284993463"]

const whype = "0x5555555555555555555555555555555555555555"

async function find() {
  for (const token of Object.values(tokens)) {
    const address = token.evmContract.address;

    // if (stables.includes(address)) {
    //   continue;
    // }

    // if (!unit.includes(address)) {
    //   continue;
    // }

    const pools = await getPools(address)

    for (const pool of pools) {
      const liq = `${Math.floor(pool.liquidity.usd / 1000)}k`;
      console.log(`${pool.dexId} ${pool.baseToken.symbol}/${pool.quoteToken.symbol} ${liq}`)
    }
  }
}

await find()
