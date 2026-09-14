import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();

function resolveFileWithExtensions(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }
  const extensions = ['.js', '.mjs', '.cjs', '.json'];
  for (const ext of extensions) {
    if (fs.existsSync(basePath + ext)) {
      return basePath + ext;
    }
  }
  for (const ext of extensions) {
    const indexPath = path.join(basePath, 'index' + ext);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const subpath = specifier.slice(2);
    const target = path.resolve(rootDir, subpath);
    const resolved = resolveFileWithExtensions(target) || target;
    return {
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL(resolved).href,
    };
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    if (context.parentURL) {
      const parentFilePath = fileURLToPath(context.parentURL);
      const parentDir = path.dirname(parentFilePath);
      const target = path.resolve(parentDir, specifier);
      const resolved = resolveFileWithExtensions(target);
      if (resolved) {
        return {
          format: 'module',
          shortCircuit: true,
          url: pathToFileURL(resolved).href,
        };
      }
    }
  }

  return nextResolve(specifier, context);
}
