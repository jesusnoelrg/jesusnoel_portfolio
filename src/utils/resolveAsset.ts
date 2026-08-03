type AssetModule = string | { src: string };

const assetModules = import.meta.glob<AssetModule>(
  '/src/assets/**/*.{svg,png,jpg,jpeg,webp,gif}',
  { eager: true, import: 'default' }
);

function normalizeAssetPath(path: string): string {
  const stripped = path.replace(/^(\.\.\/)+/, '');
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

function getAssetUrl(asset: AssetModule): string {
  return typeof asset === 'string' ? asset : asset.src;
}

export function resolveAsset(path: string | undefined): string | undefined {
  if (!path) return undefined;

  const key = normalizeAssetPath(path);
  const asset = assetModules[key];

  if (!asset) {
    console.warn(`[resolveAsset] Asset not found: ${path}`);
    return undefined;
  }

  return getAssetUrl(asset);
}

export function resolveAssets(paths: string[]): string[] {
  return paths.map((path) => resolveAsset(path)).filter((path): path is string => !!path);
}
