import AsyncStorage from "@react-native-async-storage/async-storage";

const DATA_VERSION = 10;

const KEYS = {
  applications: "arriveai:applications",
  chatThreads: "arriveai:chatThreads",
  language: "arriveai:language",
  theme: "arriveai:theme",
  dataVersion: "arriveai:dataVersion",
} as const;

export async function migrateIfNeeded(): Promise<void> {
  const stored = await AsyncStorage.getItem(KEYS.dataVersion);
  if (stored && Number(stored) >= DATA_VERSION) return;
  await AsyncStorage.multiRemove([KEYS.applications, KEYS.chatThreads]);
  await AsyncStorage.setItem(KEYS.dataVersion, String(DATA_VERSION));
}

export async function loadApplications(): Promise<any[] | null> {
  const raw = await AsyncStorage.getItem(KEYS.applications);
  return raw ? JSON.parse(raw) : null;
}

export async function saveApplications(apps: any[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.applications, JSON.stringify(apps));
}

export async function loadChatThread(docId: string): Promise<any[] | null> {
  const all = await AsyncStorage.getItem(KEYS.chatThreads);
  const map = all ? JSON.parse(all) : {};
  return map[docId] ?? null;
}

export async function saveChatThread(
  docId: string,
  messages: any[],
): Promise<void> {
  const all = await AsyncStorage.getItem(KEYS.chatThreads);
  const map = all ? JSON.parse(all) : {};
  map[docId] = messages;
  await AsyncStorage.setItem(KEYS.chatThreads, JSON.stringify(map));
}

export async function loadLanguage(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.language)) ?? "English";
}

export async function saveLanguage(lang: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.language, lang);
}

export async function loadTheme(): Promise<"light" | "dark"> {
  const val = await AsyncStorage.getItem(KEYS.theme);
  return val === "dark" ? "dark" : "light";
}

export async function saveTheme(mode: "light" | "dark"): Promise<void> {
  await AsyncStorage.setItem(KEYS.theme, mode);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.applications,
    KEYS.chatThreads,
    KEYS.language,
  ]);
}
