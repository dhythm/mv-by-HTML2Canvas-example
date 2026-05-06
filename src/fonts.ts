import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadNotoSansJP } from "@remotion/google-fonts/NotoSansJP";
import { loadFont as loadReggaeOne } from "@remotion/google-fonts/ReggaeOne";
import { loadFont as loadZenKaku } from "@remotion/google-fonts/ZenKakuGothicNew";

const anton = loadAnton();
const spaceMono = loadSpaceMono();
const notoSansJP = loadNotoSansJP();
const reggaeOne = loadReggaeOne();
const zenKaku = loadZenKaku();

export const FONT_ANTON = anton.fontFamily;
export const FONT_SPACE_MONO = spaceMono.fontFamily;
export const FONT_NOTO_JP = notoSansJP.fontFamily;
export const FONT_REGGAE = reggaeOne.fontFamily;
export const FONT_ZEN_KAKU = zenKaku.fontFamily;

export async function waitForFonts(): Promise<void> {
  await Promise.all([
    anton.waitUntilDone(),
    spaceMono.waitUntilDone(),
    notoSansJP.waitUntilDone(),
    reggaeOne.waitUntilDone(),
    zenKaku.waitUntilDone(),
  ]);
}
