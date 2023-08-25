export function extractProductIdFromSku(sku: string) {
  return sku.split('-')[0];
}
