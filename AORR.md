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

## Change Request Loop Plan

- `Loop-001`: `CR-005` - Pause 중 타이머/이동 정지와 Resume 안정화
- `Loop-002`: `CR-006` - 마우스 버튼 클릭 시 지렁이 소실 문제 수정
- `Loop-003`: `CR-007` - WASD 입력 복구
- `Loop-004`: `CR-001`, `CR-002`, `CR-003`, `CR-004` - 콘텐츠 교체

- `Loop-001` 실행 상태: `PASSED`
- `Loop-002` 실행 상태: `PASSED`
- `Loop-003` 실행 상태: `PASSED`
- `Loop-004` 실행 상태: `PASSED`

### 상태 전이

- 계획 전: `CHANGE_INTAKE -> CHANGE_PLANNED`
- 구현 중: `READY -> ACTING -> VERIFYING`
- 수정 필요: `VERIFYING -> RETRYING -> ACTING`
- 완료: `PASSED`
- 차단: `BLOCKED` 또는 `HITL_REQUIRED`
- 배포 승인 대기: `DEPLOY_APPROVAL_REQUIRED`
- 배포 완료: `DEPLOYED`

### Verifier

- 파일 존재 및 경로 확인
- `node --check game.js`
- 모의 DOM 스모크 테스트
- 브라우저 수동 재현
- 로컬 HTTP 200 확인

### Stop

- 동일 fingerprint 2회 반복
- 동일 원인 3회 Retry 초과
- 요구사항 충돌 또는 사실 확인 필요
- 브라우저 자동화가 필요하지만 환경상 불가한 경우

### HITL

- `Gei in touch` 표기 확정 필요 시 `[사람 확인 필요]`
- 마지막 정상 배포 URL 미확인 시 `[사람 확인 필요]`
