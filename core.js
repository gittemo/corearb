import fs from 'fs'
import { info } from './hl.js'

async function main() {
    const data = await info("spotMeta")

    // Enrich tokens with universeIndex
    const tokens = data.tokens
        .filter(token => token.evmContract)
        .map(token => {
            const universe = data.universe.find(universe => universe.tokens[0] === token.index);
            return { ...token, universeName: universe.name };
        });

    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
}

await main()