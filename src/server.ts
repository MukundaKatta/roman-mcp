#!/usr/bin/env node
/**
 * roman MCP server. Two tools: `to_roman`, `from_roman`.
 *
 * Convert between Arabic numerals (1-3999) and Roman numerals. Strict by
 * default — rejects malformed forms like `IIII` or `VV`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

const TABLE: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
  [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'],
  [1, 'I'],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n)) throw new Error('value must be an integer');
  if (n < 1 || n > 3999) throw new Error('value must be in [1, 3999]');
  let v = n;
  let out = '';
  for (const [num, sym] of TABLE) {
    while (v >= num) {
      out += sym;
      v -= num;
    }
  }
  return out;
}

const VALID = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export function fromRoman(s: string): number {
  const upper = s.toUpperCase();
  if (!upper) throw new Error('empty input');
  if (!VALID.test(upper)) throw new Error('not a well-formed Roman numeral: ' + s);
  let total = 0;
  let prev = 0;
  // Walk right-to-left: subtract when current < highest seen so far.
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  for (let i = upper.length - 1; i >= 0; i--) {
    const v = values[upper[i]];
    if (v < prev) total -= v;
    else {
      total += v;
      prev = v;
    }
  }
  return total;
}

const server = new Server({ name: 'roman', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'to_roman',
    description: 'Convert an integer in [1, 3999] to its Roman numeral representation.',
    inputSchema: {
      type: 'object',
      properties: { value: { type: 'integer', minimum: 1, maximum: 3999 } },
      required: ['value'],
    },
  },
  {
    name: 'from_roman',
    description: 'Parse a Roman numeral string back to an integer. Rejects malformed forms (e.g. IIII).',
    inputSchema: {
      type: 'object',
      properties: { roman: { type: 'string' } },
      required: ['roman'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === 'to_roman') {
      const a = args as unknown as { value: number };
      return jsonResult({ roman: toRoman(a.value) });
    }
    if (name === 'from_roman') {
      const a = args as unknown as { roman: string };
      return jsonResult({ value: fromRoman(a.roman) });
    }
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('roman failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`roman MCP server v${VERSION} ready on stdio\n`);
}
