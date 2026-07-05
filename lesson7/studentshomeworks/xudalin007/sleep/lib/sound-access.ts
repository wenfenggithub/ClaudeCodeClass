import type { SoundId } from "./audio-engine";
import type { SoundCategory, SoundItem } from "./sound-catalog";

export const ANONYMOUS_SOUND_BY_CATEGORY: Record<SoundCategory, SoundId> = {
  nature: "rain",
  "white-noise": "fan",
  ambient: "cafe",
  music: "music-piano-1",
};

export function canPlaySoundAnonymously(sound: Pick<SoundItem, "id" | "category">): boolean {
  return ANONYMOUS_SOUND_BY_CATEGORY[sound.category] === sound.id;
}

export function canUseSound(
  sound: Pick<SoundItem, "id" | "category">,
  loggedIn: boolean,
): boolean {
  return loggedIn || canPlaySoundAnonymously(sound);
}
