# POP MOTION REEL

1280×720 / 60fps / 30秒 8シーンのキネティックモーションリール。

## 経緯

- 当初は **Claude Design**（[claude.ai/design](https://claude.ai/design)）でデザインモックを作成し、`html2canvas` で DOM をピクセル化してパーティクル化する素の HTML/CSS/JS プロトタイプとして書き出された
- その後、動画プロジェクトとして継続管理するため **Remotion** に移管。プロトタイプの視覚仕様を踏襲しつつ、フレーム独立レンダリングで安定して書き出せる構造に再実装した

## セットアップ

```bash
npm install
```

## 開発

Remotion Studio をブラウザで開く（プレビュー・スクラブ・タイムライン編集）。

```bash
npm run studio
```

## レンダリング

```bash
# MP4 を out/ に書き出し
npm run render

# サムネイル静止画
npm run still
```

## 構成

```
src/
  index.ts              registerRoot
  Root.tsx              Composition 登録（PopMotionReel, 1280x720, 60fps, 1800f）
  PopMotionReel.tsx     8シーンを <Sequence> で連結 + HUD + Overlay
  constants.ts          色 / シーン定義 / フレーム範囲
  fonts.ts              @remotion/google-fonts 経由の Anton / Space Mono / Noto Sans JP / Reggae One / Zen Kaku Gothic
  components/
    Stage.tsx           背景ステージ
    Hud.tsx             REC / タイムコード / シーン番号 / プログレス
    Overlay.tsx         グレイン / ヴィネット / ビートフラッシュ
  scenes/
    Scene1Intro.tsx     "POP!" タイトルバウンス + ブロブ
    Scene2Marquee.tsx   4行マーキー（チップ付き）
    Scene3Shatter.tsx   カード + Canvas 粒子シャッター
    Scene4Kinetic.tsx   幾何学シェイプの回転・バウンス・脈動
    Scene5Quote.tsx     日本語引用のタイプライター
    Scene6Particles.tsx パーティクルフィールド（中心引力 + スワール）
    Scene7Poster.tsx    ポスター + 渦巻きシャッター
    Scene8Outro.tsx     アウトロのレイ + タイトル
```

## プロトタイプからの主な書き換えポイント

- **`html2canvas` を不採用**。Remotion のフレーム独立レンダリングと相性が悪いため、各シャッターシーンは「シードベースの決定的乱数で粒子を生成し Canvas に描画」+「DOM 側でカード/ポスターを通常レンダリング」というハイブリッドに置き換え。視覚効果は維持しつつ毎フレーム再現性のある描画を実現
- **CSS animation / Web Animations API（`element.animate(...)`）を全廃**。Remotion ではレンダ時に反映されないため、すべて `useCurrentFrame()` + `interpolate` / `spring` ベースに移植
- **フォントは `@remotion/google-fonts`** で読み込み、レンダリング時の確実性を担保
