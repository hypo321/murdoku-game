// Custom ESM loader to mock .jpg imports and resolve extensionless .js for Node.js testing
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  // Mock image imports
  if (specifier.endsWith('.jpg') || specifier.endsWith('.png')) {
    return {
      url: 'data:text/javascript,export default "mock-image"',
      shortCircuit: true,
    };
  }

  // Try adding .js extension for extensionless relative imports
  if (
    specifier.startsWith('.') &&
    !specifier.endsWith('.js') &&
    !specifier.endsWith('.mjs')
  ) {
    try {
      return await nextResolve(specifier + '.js', context);
    } catch {
      // Fall through to default resolution
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === 'data:text/javascript,export default "mock-image"') {
    return {
      format: 'module',
      source: 'export default "mock-image"',
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
