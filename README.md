1. Run `core.js` to generate `tokens.json`, a file which contains all spot-listed tokens that are deployed to HyperEVM.
2. Run `check.js` to iterate over that list and find pools for a given token pair across L1 and DEXes

Use `find.js` to dump all available pools

This is using Dexscreener API to find the pools (currently with over 10k liquid), not sure how accurate / up-to-date this data is.
When running it yesterday, I didn't find any obvious price discrepancies.
Not sure how to proceed from here, so leaving this up to anyone to maybe be useful to
