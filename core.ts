import fs from 'fs';
import { info } from './api.ts';

async function main() {
  const data = await info("spotMeta");

  // Enrich tokens with universeIndex
  const tokens = data.tokens
  .filter(token => token.evmContract || token.name == "HYPE")
  .map(token => {
    const universe = data.universe.find(universe => universe.tokens[0] === token.index);
    return { ...token, universeName: universe.name, address: token.evmContract?.address || "0x5555555555555555555555555555555555555555" };
  });

  // Convert tokens array into an object where each key is the token's name
  const tokensByName = tokens.reduce((acc, token) => {
    acc[token.name] = token;
    return acc;
  }, {});

  tokensByName.WHYPE = tokensByName.HYPE
  delete tokensByName.HYPE

  fs.writeFileSync('tokens.json', JSON.stringify(tokensByName, null, 2));
}

await main();
