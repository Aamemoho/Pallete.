# 🎨 팔레트

화면에서 요소를 하나씩 빼보고, 뭐가 죽는지 본다.
관찰은 Are.na에 쌓고, 그중 **뺄 수 있는 것만** 여기서 요소가 된다.

- 관찰 = Are.na 채널의 블록 (뺀 것 / 예상 / 실제)
- 요소 = 켜고 끌 수 있는 값 하나 + 그 값의 중립값
- 감산 = 제거가 아니라 중립값으로 되돌리기

## 시작하기

1. `build.mjs` 위쪽 `CHANNEL`에 Are.na 채널 슬러그를 넣는다.
   채널을 열었을 때 주소의 마지막 조각. `https://www.are.na/aamemoho-oh/<이 부분>`
2. `npm run build`
3. `site/`를 아무 정적 서버로 열어본다. (`npx serve site`)

빌드는 두 가지를 만든다.

- `site/data/arena.json` — 채널 스냅샷. 방문할 때마다 API를 때리지 않게 굳혀둔다.
  Are.na가 안 되면 이전 스냅샷을 그대로 쓰고 빌드는 통과한다.
- `site/data/elements.json` — `site/elements/*/meta.json`을 훑은 목록.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `site`
- 환경변수 `ARENA_CHANNEL`로 슬러그를 덮어쓸 수 있다.

## 요소 추가하기

`site/elements/<이름>/` 폴더를 만들고 두 파일만 넣는다.
루트 목록은 빌드할 때 자동으로 다시 훑으므로, 등록하는 곳은 따로 없다.

```
site/elements/<이름>/
  index.html   # 값 하나를 조절하는 화면. 켠 상태와 중립 상태
  meta.json    # name, param, neutral, observed, from, note
```

`neutral`이 이 시스템의 핵심 필드다. 요소를 뺀다는 건 이 값으로 되돌린다는 뜻이고,
중립값을 정하지 못하는 것은 아직 요소가 아니라 관찰이다.
