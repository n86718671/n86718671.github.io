# AORR 상태 머신

이 문서는 `n86718671.github.io` 정적 사이트와 지렁이 게임을 위한 실행 상태 머신이다.

## Target

- GitHub Pages용 개인 프로페셔널 웹사이트
- 반응형 데스크톱/모바일 레이아웃
- `Games` 탭
- 키보드와 모바일 터치로 조작 가능한 지렁이 게임

## Current State

- 현재 루트에 `index.html`, `styles.css`, `script.js`, `game.js`가 존재한다.
- 파일 연결과 로컬 HTTP 200은 확인됐다.
- 브라우저 렌더/viewport 자동화는 현재 환경에서 별도 도구가 없다 `[사람 확인 필요]`.

## Loop

- `READY -> ACTING -> VERIFYING -> PASSED`
- 실패 시 `RETRYING`
- 환경/권한/요구사항 불명확 시 `HITL_REQUIRED`

