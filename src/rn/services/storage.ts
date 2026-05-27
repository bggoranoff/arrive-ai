import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  applications: "arriveai:applications",
  chatThreads: "arriveai:chatThreads",
} as const;

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

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.applications, KEYS.chatThreads]);
}
