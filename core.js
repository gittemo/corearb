const fs = require('fs');

(async () => {
    const response = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "spotMeta" })
    });

    const data = await response.json();

    // Enrich tokens with universeIndex
    const tokens = data.tokens
        .filter(token => token.evmContract)
        .map(token => {
            const universe = data.universe.find(universe => universe.tokens[0] === token.index);
            if (!universe) {
                console.log(token);
                return token;
            }
            return { ...token, universeName: universe.name };
        });

    fs.writeFileSync('addies.json', JSON.stringify(tokens, null, 2));
})();
