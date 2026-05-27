import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

const imageAssets: Record<string, number> = {
  wohnungsgeberbestaetigung: require("../../../assets/documents/wohnungsgeberbestaetigung.jpg"),
  anmeldung: require("../../../assets/documents/anmeldung.jpg"),
  kg1_antrag: require("../../../assets/documents/kg1_antrag.jpg"),
  kg1_anlage_kind: require("../../../assets/documents/kg1_anlage_kind.jpg"),
};

export function getDocumentImageSource(
  imageKey: string,
): number | undefined {
  return imageAssets[imageKey];
}

export async function getDocumentImageBase64(
  imageKey: string,
): Promise<string | null> {
  const assetModule = imageAssets[imageKey];
  if (!assetModule) return null;

  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();

  if (!asset.localUri) return null;

  const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
    encoding: "base64",
  });
  return base64;
}
