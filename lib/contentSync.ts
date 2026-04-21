"use client";

const CHANNEL_NAME = "onyxx-content-updates";
const STORAGE_KEY = "onyxx-content-updated-at";

type UpdatePayload = {
  ts: number;
  source?: string;
};

export function emitContentUpdate(source = "admin-upload") {
  if (typeof window === "undefined") return;
  const payload: UpdatePayload = { ts: Date.now(), source };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // no-op (private mode / storage blocked)
  }

  if ("BroadcastChannel" in window) {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  }
}

export function subscribeToContentUpdates(onUpdate: () => void) {
  if (typeof window === "undefined") return () => {};

  let bc: BroadcastChannel | null = null;

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) onUpdate();
  };

  window.addEventListener("storage", onStorage);

  if ("BroadcastChannel" in window) {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = () => onUpdate();
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    bc?.close();
  };
}
