---
name: 서울시티
description: 서울 상황별 나들이 가이드. 행사·혜택·먹거리·생활 정보글을 한곳에서 찾는 동네 잡지 같은 공공정보 사이트
colors:
  paper: "#faf8f4"
  surface: "#fffdfa"
  surface-muted: "#f6f3ed"
  line: "#e1dbd1"
  ink: "#292722"
  ink-strong: "#24221f"
  text-body: "#5b554e"
  text-muted: "#6f6962"
  umber: "#80573c"
  umber-soft: "#f5eee5"
  mauve: "#735783"
  mauve-soft: "#f2eef6"
  sage: "#486d54"
  sage-soft: "#edf3ef"
typography:
  display:
    fontFamily: "Noto Sans KR, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.6rem)"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "-0.075em"
  heading:
    fontFamily: "Noto Sans KR, sans-serif"
    fontSize: "clamp(1.55rem, 2.8vw, 2rem)"
    fontWeight: 750
    lineHeight: 1.4
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Noto Sans KR, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Noto Sans KR, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.18em"
  serif:
    fontFamily: "Noto Serif KR, Georgia, serif"
    fontWeight: 500
rounded:
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  gutter-mobile: "16px"
  section: "clamp(3rem, 6vw, 5.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "10px 22px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 19px"
    height: "44px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.pill}"
  chip-selected:
    backgroundColor: "{colors.ink-strong}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# 서울시티 디자인 시스템

## Overview

서울시티는 관공서 포털이 아니라 동네 잡지처럼 읽히는 공공정보 사이트다. 홈과 먹거리 페이지는 종이색 바탕, 포스터 표지(`SeoulCover`), 25개 구 타일 지도로 서울다움을 만든다. 목록·상세 페이지는 정보를 빨리 찾는 화면이라 꾸밈보다 일관성과 훑어보기 쉬움을 우선한다. 브랜드 이름은 ‘서울시티’ 하나만 쓴다.

## Colors

- Tailwind 기본 색 이름을 브랜드 색으로 다시 매핑했다(`src/app/globals.css`의 `@theme`). `slate`=종이·잉크 계열, `sky`=움버(갈색), `blue`=모브(보라), `cyan`=세이지(녹색), `indigo`=모브 변형.
- 용도: 행사=움버(`sky`), 혜택=모브(`blue`), 먹거리=세이지(`cyan`/`emerald`), 블로그=`indigo`.
- 보조 글자는 `text-slate-400`(`#6f6962`) 이상. 밝은 바탕에서 대비 4.5:1을 넘는다. 이보다 흐린 회색을 글자에 쓰지 않는다.
- 그라데이션 글자는 쓰지 않는다. 강조는 굵기·크기·움버 단색으로 한다.

## Typography

- 본문·제목은 Noto Sans KR, 표지 제목과 큰 숫자는 Noto Serif KR 500(`font-serif`).
- 한글은 단어 단위로 줄을 바꾼다(`body { word-break: keep-all }`). 제목은 `text-wrap: balance`.
- 기능 글자는 12px(`text-xs`) 이상. 8px·10px·11px 글자를 만들지 않는다.
- 제목 위에 영어 꼬리표(kicker)를 붙이지 않는다. 제목이 스스로 말하게 한다. 메뉴 묶음 이름처럼 필요한 라벨은 한국어 `.eyebrow`로 쓴다.

## Layout

- 본문 폭은 `max-w-6xl`(목록), `max-w-4xl`(상세), `max-w-3xl`(블로그 글). 모바일 좌우 여백 16px, 가로 넘침 없음.
- 상세 페이지 순서: 분류 칩 → 제목 → 요약 → 핵심 정보(`DetailFacts variant="key"`) → 주 버튼 → 포스터 → 보조 정보 → 안내 → 데이터 출처.
- 빈 값·‘기타’·‘정보 없음’은 칸째 숨긴다(`isMeaningfulFactValue`).

## Elevation & Depth

- 그림자는 부드럽고 낮게: `shadow-soft`(`0 10px 30px rgb(64 48 31 / 4%)`)와 카드 기본 `0 8px 24px rgba(15,23,42,0.04)`.
- 카드 안에 또 테두리 상자를 넣지 않는다. 카드 안 정보는 `border-t` 구분선 목록으로 나눈다.

## Shapes

- 버튼·칩은 완전한 둥근 모서리(`rounded-full`). 카드는 `rounded-2xl`, 큰 패널은 `rounded-3xl`.
- 포커스 링은 2px 움버(`#80573c`), 간격 4px.

## Components

- 주 버튼 `.button-primary`(잉크 바탕), 보조 버튼 `.button-secondary`(테두리). 화면마다 주 버튼은 하나. 문구는 줄바꿈하지 않는다.
- 필터 칩: 기본은 흰 바탕·회색 테두리, 선택 상태는 모든 목록에서 잉크 바탕(`border-slate-950 bg-slate-950 text-white`).
- 아이콘은 `LineIcon`(1.6 굵기 선 아이콘)만 쓴다. 이모지를 아이콘으로 쓰지 않는다.
- 카드에서 상세로 가는 링크 문구는 ‘자세히 보기 →’로 통일한다.
- 화살표: 사이트 안 이동은 →, 새 창으로 나가는 외부 링크만 ↗와 화면낭독기용 “(새 창)”을 붙인다.

## Do's and Don'ts

- Do: 홈 지도·포스터 표지처럼 서울에만 있는 요소로 개성을 낸다.
- Do: 결과가 없을 때 원인과 다음에 갈 곳(상황별 가이드, 전체 목록)을 함께 보여준다.
- Don't: 그라데이션 글자, 영어 꼬리표, 이모지 아이콘, 카드 안 카드, 12px 미만 글자.
- Don't: 사용자 화면에 수집 스크립트 이름·내부 경로 같은 운영 정보를 보이지 않는다.
