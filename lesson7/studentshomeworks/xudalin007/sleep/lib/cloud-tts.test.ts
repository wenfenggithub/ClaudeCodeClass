import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fullAudioCacheKey,
  paragraphCacheKey,
  synthesizeParagraph,
  ttsTextFingerprint,
} from "./cloud-tts";

interface MockIdb {
  store: Map<string, ArrayBuffer>;
  get: ReturnType<typeof vi.fn<[string], Promise<ArrayBuffer | undefined>>>;
  set: ReturnType<typeof vi.fn<[string, ArrayBuffer], Promise<void>>>;
}

const idb = vi.hoisted(() => {
  const store = new Map<string, ArrayBuffer>();
  return {
    store,
    get: vi.fn((key: string) => Promise.resolve(store.get(key))),
    set: vi.fn((key: string, value: ArrayBuffer) => {
      store.set(key, value);
      return Promise.resolve();
    }),
  } satisfies MockIdb;
});

vi.mock("idb-keyval", () => ({
  get: idb.get,
  set: idb.set,
}));

describe("cloud TTS cache keys", () => {
  beforeEach(() => {
    idb.store.clear();
    idb.get.mockClear();
    idb.set.mockClear();
    vi.unstubAllGlobals();
  });

  it("同一文本生成稳定指纹，不同文本生成不同指纹", () => {
    expect(ttsTextFingerprint("今晚慢慢休息")).toBe(ttsTextFingerprint("今晚慢慢休息"));
    expect(ttsTextFingerprint("今晚慢慢休息")).not.toBe(ttsTextFingerprint("今天短暂停顿"));
  });

  it("段落缓存键包含文本指纹，避免脚本改写后复用旧 MP3", () => {
    const base = {
      storyId: "med-mind-5",
      paragraphIdx: 3,
      voice: "default",
      engine: "aliyun",
      speed: 0.95,
    };

    const first = paragraphCacheKey({ ...base, text: "第一版引导词" });
    const same = paragraphCacheKey({ ...base, text: "第一版引导词" });
    const changed = paragraphCacheKey({ ...base, text: "第二版引导词" });

    expect(first).toBe(same);
    expect(first).not.toBe(changed);
  });

  it("整篇缓存键包含全文指纹", () => {
    const base = {
      storyId: "story-1",
      voice: "default",
      engine: "aliyun",
      speed: 0.95,
    };

    expect(fullAudioCacheKey({ ...base, paragraphs: ["a", "b"] })).toBe(
      fullAudioCacheKey({ ...base, paragraphs: ["a", "b"] }),
    );
    expect(fullAudioCacheKey({ ...base, paragraphs: ["a", "b"] })).not.toBe(
      fullAudioCacheKey({ ...base, paragraphs: ["a", "c"] }),
    );
  });

  it("段落 MP3 已缓存时不再请求 TTS API", async () => {
    const cached = new Uint8Array([1, 2, 3]).buffer;
    const key = paragraphCacheKey({
      storyId: "med-mind-5",
      paragraphIdx: 0,
      text: "已经缓存的引导词",
      voice: "default",
      engine: "aliyun",
      speed: 0.95,
    });
    idb.store.set(key, cached);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await synthesizeParagraph({
      storyId: "med-mind-5",
      paragraphIdx: 0,
      text: "已经缓存的引导词",
      voice: "default",
      engine: "aliyun",
      speed: 0.95,
    });

    expect(result).toBe(cached);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(idb.set).not.toHaveBeenCalled();
  });
});
