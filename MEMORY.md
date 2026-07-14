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
| 현재 상태 | 정적 사이트 기본 구조와 게임 엔진 구현 완료, `Loop-001`, `Loop-002`, `Loop-004` 검증 통과 |
| 완료한 루프 | 초기 정적 셸 생성, 개인 콘텐츠 미확정 영역 자리표시자 반영, 실제 대상 저장소로 전환, Pause/마우스 입력 버그 수정, 프로필/경력/프로젝트/연락처 콘텐츠 교체 |
| 다음 루프 | `Loop-003` WASD 입력 복구, 이후 배포 준비 |
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

## Change Request Context

- 마지막 정상 배포 commit: `6abc849`
- 마지막 정상 배포 URL: `[사람 확인 필요]`
- 새로운 전체 Change Request ID: `CR-2026-07-14-001`
- Change Item 목록: `CR-001`, `CR-002`, `CR-003`, `CR-004`, `CR-005`, `CR-006`, `CR-007`
- 사용자 요청 요약: About/Profile, Experience, Projects, Contact 콘텐츠를 실제 사용자 정보로 교체하고 snake 게임의 Pause, 마우스 버튼 클릭, WASD 버그를 수정
- 참고 자료: 사용자 수정 요청 원문, 현재 `index.html`, `styles.css`, `script.js`, `game.js`
- 현재 상태: 변경 요청 분석 완료, 구현 전
- 현재 상태: `CR-005`와 `CR-006` 구현 및 검증 완료, `CR-007`과 콘텐츠 교체 대기
- 현재 상태: `CR-005`, `CR-006`, `CR-001`, `CR-002`, `CR-003`, `CR-004` 반영 완료, `CR-007` 대기
- 새 완료 기준: 콘텐츠 반영 완료 + snake 게임 버그 3종 수정 완료 + 회귀 확인 완료
- 루프 실행 순서: `Loop-001`, `Loop-002`, `Loop-003`, `Loop-004`
- 다음 Step 9에서 실행할 첫 번째 Loop ID: `Loop-003`
- Rollback 기준: Pause/Resume 버그 또는 입력 버그 재발 시 직전 커밋으로 되돌리지 말고 해당 Change Item만 재수정
- 사람 확인 필요 항목: `Gei in touch` 표기 확정, 마지막 정상 배포 URL
- 사람 확인 필요 항목: 마지막 정상 배포 URL

### Loop 2026-07-14-006

- 시작 시각: 2026-07-14
- 목표: `CR-001`, `CR-002`, `CR-003`, `CR-004` 콘텐츠 교체 완료
- 시작 상태: 프로필/경력/프로젝트/연락처에 `[사람 확인 필요]` 자리표시자가 남아 있음
- 가설: 요청된 텍스트만 최소 치환하면 레이아웃 변경 없이 콘텐츠를 반영할 수 있다
- Act: `index.html`의 자리표시자 문구를 사용자 제공 값으로 교체
- 변경 파일: `index.html`, `MEMORY.md`, `AORR.md`, `CHANGE_REQUEST.md`
- Verifier: `rg` 텍스트 검색으로 placeholder 제거와 요청 문구 반영 확인
- 테스트 결과: `n86718671 입니다.`, `Agentic Coding 의 Loop Engineering 을 배우고 있습니다.`, `AI에게 믿음을 가지고 일을 시킬 수 있는지에 대해서 관심을 가지고 있습니다.`, `회사원입니다.`, `학교를 다니다가 회사에서 일을 하고 있습니다.`, 3개 프로젝트명, `n86718671@google.com`, `n8671`, `대한민국 수원시` 확인
- exit code: `0`
- 오류 fingerprint: 없음
- Retry 횟수: 0
- 종료 상태: `PASSED`
- 다음 작업: `CR-007` WASD 입력 복구
- 사람 확인 필요 항목: 마지막 정상 배포 URL

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

### Loop 2026-07-14-002

- 시작 시각: 2026-07-14
- 목표: Pause/Restart 및 모바일 방향 버튼 입력 경로 점검
- 시작 상태: 게임 엔진과 방향 버튼 클릭 경로는 구현되어 있으나 실제 상태 전이가 미검증
- 가설: 문자열 방향 입력을 좌표로 정규화하면 마우스/버튼 입력에서도 게임 상태가 유지된다
- Act: 모의 DOM으로 `start`, `pause`, `restart`, 방향 버튼 클릭 경로를 검증
- 변경 파일: `game.js`, `MEMORY.md`
- Verifier: Node 기반 모의 DOM 스모크 테스트
- 테스트 결과: 방향 버튼 클릭 후 `running=true`, `nextDirection` 갱신 확인; `Pause` → `Resume` 전환 확인; `Restart` 후 점수 0 및 재시작 상태 확인
- exit code: `0`
- 오류 fingerprint: 없음
- Retry 횟수: 0
- 종료 상태: `PASSED`
- 다음 작업: 실제 브라우저 렌더/viewport 확인 또는 GitHub Pages 배포 전 최종 검토
- 사람 확인 필요 항목: 브라우저 자동화 도구, 실제 모바일 터치 체감

### Loop 2026-07-14-003

- 시작 시각: 2026-07-14
- 목표: 배포 후 사용자 수정 요청을 Change Request로 분해
- 시작 상태: GitHub Pages 배포 후 검수 요청과 snake/콘텐츠 수정 요청이 전달됨
- 가설: 요청을 원자적인 Change Item과 실행 루프로 나누면 구현 순서와 위험을 관리할 수 있다
- Act: `CHANGE_REQUEST.md` 생성, `AORR.md`와 `MEMORY.md`에 Change Request Loop Plan과 기준선 추가
- 변경 파일: `CHANGE_REQUEST.md`, `AORR.md`, `MEMORY.md`
- Verifier: 현재 저장소 파일 구조와 git 상태 확인, 사용자 요청 원문 보존 확인
- 테스트 결과: 요청을 7개 Change Item으로 분해, 실행 순서와 HITL 조건 정의 완료
- exit code: `0`
- 오류 fingerprint: 없음
- Retry 횟수: 0
- 종료 상태: `CHANGE_PLANNED`
- 다음 작업: `Loop-001`부터 개별 버그 수정 및 콘텐츠 교체
- 사람 확인 필요 항목: `Gei in touch` 표기, 마지막 정상 배포 URL

### Loop 2026-07-14-004

- 시작 시각: 2026-07-14
- 목표: `CR-005` Pause 중 진행/Resume 충돌 버그 수정
- 시작 상태: Pause 후 장시간 경과 시 Resume 때 벽 충돌 가능성 존재
- 가설: pause/resume 경계에서 `lastFrame`과 `accumulator`를 리셋하면 누적 프레임이 사라진다
- Act: `game.js`의 `togglePause()`와 `loop()`에서 pause 경계 시간 누적을 제거
- 변경 파일: `game.js`, `MEMORY.md`
- Verifier: `node --check game.js`, Node 모의 DOM 시뮬레이션
- 테스트 결과: `start -> pause -> long wait -> resume` 시 `accumulator=0` 유지, Pause 상태에서 뱀 위치/시간 진행 정지 확인
- exit code: `0`
- 오류 fingerprint: 없음
- Retry 횟수: 0
- 종료 상태: `PASSED`
- 다음 작업: `CR-006` 마우스 버튼 입력 버그
- 사람 확인 필요 항목: 실제 브라우저에서의 Pause 체감

### Loop 2026-07-14-005

- 시작 시각: 2026-07-14
- 목표: `CR-006` 마우스 버튼 클릭 시 지렁이 소실 버그 검증
- 시작 상태: 방향 입력이 문자열로 전달되던 경로를 정규화한 뒤, 실제 소실 재현 여부를 다시 확인해야 함
- 가설: 방향 버튼 입력을 좌표로 정규화하고 시작 상태만 전환하면 마우스 클릭 후에도 지렁이는 정상 유지된다
- Act: `game.js`의 방향 버튼 클릭 경로를 Node 모의 DOM으로 재검증
- 변경 파일: `MEMORY.md`, `AORR.md`
- Verifier: `node --check game.js`, Node 모의 DOM 시뮬레이션
- 테스트 결과: 버튼 클릭 후 `running=true`, `paused=false`, `gameOver=false`, `snakeLen=3`, `status=Playing`, `nextDirection={x:0,y:-1}` 확인
- exit code: `0`
- 오류 fingerprint: 없음
- Retry 횟수: 0
- 종료 상태: `PASSED`
- 다음 작업: `CR-007` WASD 입력 복구
- 사람 확인 필요 항목: 실제 Chrome에서의 버튼 클릭 체감
