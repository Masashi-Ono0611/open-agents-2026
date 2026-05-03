# Example 02 — Call an arbitrary contract write

This example uses **KeeperSakeVault** (the project's existing dapp) as the target — you can substitute any verified contract on Base Sepolia.

## User prompt

> Call `execute(0x08D811A358850892029251CcC8a565a32fd2dCB8)` on the KeeperSakeVault at `0x3A22bD29499702bEbc4225BfcDEAaE5DD8ae8743` via KeeperHub.

## Generated workflow shape

```jsonc
{
  "name": "KeeperSake — execute(0x08D8…)",
  "nodes": [
    { "id": "trigger-manual", "type": "trigger",
      "data": { "label": "Manual Trigger", "type": "trigger",
                "config": { "triggerType": "Manual" } } },
    { "id": "call-execute", "type": "action",
      "data": { "label": "Execute KeeperSake", "type": "action",
                "config": {
                  "actionType": "web3/write-contract",
                  "network": "84532",
                  "contractAddress": "0x3A22bD29499702bEbc4225BfcDEAaE5DD8ae8743",
                  "abi": "<auto-fetched-via-basescan>",
                  "abiFunction": "execute",
                  "functionArgs": "[\"0x08D811A358850892029251CcC8a565a32fd2dCB8\"]",
                  "integrationId": "<wallet>",
                  "gasLimitMultiplier": "1.2"
                } } }
  ],
  "edges": [{ "id": "e1", "source": "trigger-manual", "target": "call-execute", "type": "default" }]
}
```

## Pitfalls specific to `web3/write-contract`

- ABI is **auto-fetched** from BaseScan if the contract is verified. For unverified contracts, the skill must paste the JSON ABI string into the `abi` field.
- `functionArgs` is a **JSON string of an array** — not an inline JS array.
- `abiFunction` must match the function name exactly — case-sensitive.

## Why this is the punchline

Once `web3/write-contract` works end-to-end, **any** contract action becomes a one-prompt operation. The skill is no longer about KeeperHub specifically — it's a generic onchain effect handler whose backend happens to be KeeperHub's agentic wallet network.

This is what enables the `KeeperSake` dapp's "👉 Trigger delivery now" button at `app/keepersake/frontend/app/heir/[address]/page.tsx` — the same primitive, just invoked from a UI rather than a CLI.
