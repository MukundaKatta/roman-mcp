# roman-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/roman-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/roman-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: convert between Arabic and Roman numerals. Strict — `IIII` and
`VV` are rejected. Range: 1-3999.

## Tools

- `to_roman` — `{ value: 1994 }` → `{ roman: "MCMXCIV" }`
- `from_roman` — `{ roman: "MCMXCIV" }` → `{ value: 1994 }`

## Configure

```json
{ "mcpServers": { "roman": { "command": "npx", "args": ["-y", "@mukundakatta/roman-mcp"] } } }
```

## License

MIT.
