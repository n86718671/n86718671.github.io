# MEMORY.md

프로페셔널 웹사이트 개발 루프의 상태와 가드레일을 관리하기 위한 메모다.

## Goal

- GitHub Pages용 프로페셔널 웹사이트 완성
- 반응형 데스크톱 및 모바일 지원
- `Games` 탭 구현
- 키보드와 모바일 터치로 조작 가능한 지렁이 게임 구현

## Current State

| 항목 | 상태 |
| --- | --- |
| 현재 상태 | 정적 사이트 기본 구조와 게임 엔진 구현 완료 |
| 완료한 루프 | 초기 정적 셸 생성, 개인 콘텐츠 미확정 영역 자리표시자 반영, 실제 대상 저장소로 전환 |
| 다음 루프 | 브라우저 렌더/viewport 확인, 이후 콘텐츠 확정 및 배포 준비 |
| 현재 Retry 횟수 | 0 |
| 현재 오류 fingerprint | 없음 |
| Blocker | 브라우저 자동화 도구 부재 `[사람 확인 필요]` |

## Guardrails

- 기존 개인 콘텐츠 임의 삭제 금지
- 확인되지 않은 경력/프로젝트 정보 생성 금지
- 토큰 출력 금지
- 토큰을 코드나 Git에 저장 금지
- `github_token.txt`와 `env_settings.txt`를 커밋 금지
- 대규모 리팩토링 금지

## Execution Log

### Loop 2026-07-14-001

- 시작 시각: 2026-07-14
- 목표: 대상 GitHub Pages 저장소에 안전한 첫 정적 구조와 게임 기반을 만든다
- 시작 상태: 대상 저장소는 `README.md`만 있는 초기 상태
- 가설: 반응형 포트폴리오 셸과 단일 snake 게임 엔진을 먼저 넣으면 이후 콘텐츠와 배포를 안정적으로 이어갈 수 있다
- Act: `index.html`, `styles.css`, `script.js`, `game.js`, `AORR.md`, `MEMORY.md` 작성
- 변경 파일: `README.md`, `index.html`, `styles.css`, `script.js`, `game.js`, `AORR.md`, `MEMORY.md`
- Verifier: `node --check script.js`, `node --check game.js`, 정적 파일 존재 검사, `python3 -m http.server` + `curl -I`
- 테스트 결과: 파일 연결과 로컬 HTTP 200 확인
- exit code: `0`
- 오류 fingerprint: 없음
- Retry 횟수: 0
- 종료 상태: `PASSED`
- 다음 작업: 브라우저 렌더/viewport 검증 및 필요 시 콘텐츠 구체화
- 사람 확인 필요 항목: 실제 프로필 콘텐츠, 브라우저 자동화 도구
