# CHANGE_REQUEST.md

전체 Change Request ID: `CR-2026-07-14-001`

기준선:

- 기준선 commit: `6abc849`
- 마지막 정상 배포 URL: `[사람 확인 필요]`
- 기준 저장소: `n86718671/n86718671.github.io`

사용자 요청 원문:

> [수정이 필요한 사항]
> 1. 컨탠츠를 수정하겠습니다.
>    - About/Profile
>      - 소개: n86718671 입니다.
>      - 경력: Agentic Coding 의 Loop Engineering 을 배우고 있습니다.
>      - 연구: AI에게 믿음을 가지고 일을 시킬 수 있는지에 대해서 관심을 가지고 있습니다.
>    - Experience / Work History
>      - 현재: 회사원입니다.
>      - 이전: 학교를 다니다가 회사에서 일을 하고 있습니다.
>    - Selected Projects
>      - Project 01: 종이접기 비행기 날리기 프로젝트
>      - Project 02: 모래사장에서 단단한 모래성 만들기 프로젝트
>      - Project 03: 바람의 세기와 방향이 달리기에 주는 영향에 대한 리서치
>    - Gei in touch
>      - 이메일 : n86718671@google.com
>      - 깃허브 : n8671
>      - 위치 : 대한민국 수원시
>
> 2. Snake Game
>    - 버그
>      - Pause 누르면, 뱀의 위치가 그대로여야 하는데, 백그라운드에서 뱀이 계속 이동하게 되는 것 같습니다. Pause 후 시간이 좀 흐른 상태에서 Resume 을 하면 뱀에 벽에 충돌합니다.
>      - 마우스로 게임의 버튼을 클릭하면 뱀이 사라집니다.
>      - WASD 키보드 입력이 동작하지 않습니다.

현재 상태:

- 정적 사이트와 snake 게임이 이미 배포된 상태에서 수정 요청이 들어왔다.
- 콘텐츠는 아직 `[사람 확인 필요]` 자리표시자가 남아 있다.
- 게임 조작은 일부 입력 경로가 브라우저에서 재현 문제가 있다.

Change Item 요약:

| ID | 요청 분류 | 요청 요약 | 위험도 | 배포 필요 여부 |
| --- | --- | --- | --- | --- |
| CR-001 | CONTENT | About/Profile 소개 문구를 실제 사용자 정보로 교체 | LOW | 아니오 |
| CR-002 | CONTENT | Experience / Work History를 사용자 경력으로 교체 | LOW | 아니오 |
| CR-003 | CONTENT | Selected Projects를 사용자 제공 3개 프로젝트로 교체 | LOW | 아니오 |
| CR-004 | CONTENT | Contact 섹션 이메일/깃허브/위치를 실제 값으로 교체 | LOW | 아니오 |
| CR-005 | BUG, GAME_STATE | Pause 후 백그라운드 진행과 Resume 시 충돌 문제 수정 | HIGH | 아니오 |
| CR-006 | BUG, GAME_CONTROL | 마우스 버튼 클릭 시 지렁이 사라짐 문제 수정 | HIGH | 아니오 |
| CR-007 | BUG, GAME_CONTROL | WASD 키보드 입력 미동작 문제 수정 | HIGH | 아니오 |

## Change Item Details

### CR-001

- Change Item ID: `CR-001`
- 사용자 요청 원문: `소개: n86718671 입니다.`
- 요청 요약: About/Profile 소개를 사용자 실명/식별명으로 교체
- 요청 분류: `CONTENT`
- 현재 동작: About/Profile에 `[사람 확인 필요]` 또는 자리표시자가 보인다
- 기대 동작: 소개 문구가 `n86718671 입니다.`로 표시된다
- 재현 방법: About/Profile 섹션을 확인한다
- 근거 자료: 사용자 수정 요청 원문
- 수정 대상 기능: About/Profile 콘텐츠
- 예상 수정 파일: `index.html`
- 변경 허용 범위: 소개 텍스트와 관련 마크업
- 변경 금지 범위: 레이아웃 전체 재작성, 게임 코드 변경
- 선행 작업: 없음
- 후속 작업: CR-004와 회귀 확인
- 다른 Change Item과의 의존성: 없음
- 완료 기준: About/Profile 소개가 요청 문구로 표시됨
- 검증 방법: 렌더 확인, 텍스트 검색
- 회귀 테스트: About 섹션 레이아웃, 모바일 레이아웃, 내부 링크
- 위험도: `LOW`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: 없음

### CR-002

- Change Item ID: `CR-002`
- 사용자 요청 원문: `경력: Agentic Coding 의 Loop Engineering 을 배우고 있습니다.`
- 요청 요약: Experience / Work History의 경력 내용을 학습 중인 loop engineering으로 교체
- 요청 분류: `CONTENT`
- 현재 동작: 경력 카드가 자리표시자다
- 기대 동작: 경력 카드가 요청 문구로 표시된다
- 재현 방법: Experience 섹션을 확인한다
- 근거 자료: 사용자 수정 요청 원문
- 수정 대상 기능: Experience / Work History 콘텐츠
- 예상 수정 파일: `index.html`
- 변경 허용 범위: 텍스트 업데이트
- 변경 금지 범위: 구조 변경, 게임 코드 변경
- 선행 작업: 없음
- 후속 작업: CR-004와 회귀 확인
- 다른 Change Item과의 의존성: 없음
- 완료 기준: 경력 문구가 정확히 표시됨
- 검증 방법: 렌더 확인, 텍스트 검색
- 회귀 테스트: Experience 카드 배열, 모바일 카드 줄바꿈
- 위험도: `LOW`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: 없음

### CR-003

- Change Item ID: `CR-003`
- 사용자 요청 원문: `Selected Projects`의 3개 프로젝트 항목 전체
- 요청 요약: 프로젝트 카드 3개를 사용자 제공 프로젝트명으로 교체
- 요청 분류: `CONTENT`
- 현재 동작: 프로젝트 카드가 자리표시자다
- 기대 동작: 프로젝트 카드에 제공된 프로젝트명이 표시된다
- 재현 방법: Projects 섹션을 확인한다
- 근거 자료: 사용자 수정 요청 원문
- 수정 대상 기능: Projects 콘텐츠
- 예상 수정 파일: `index.html`
- 변경 허용 범위: 프로젝트 카드 제목/설명 텍스트
- 변경 금지 범위: 카드 구조, CSS 레이아웃, 게임 코드
- 선행 작업: 없음
- 후속 작업: CR-004와 회귀 확인
- 다른 Change Item과의 의존성: 없음
- 완료 기준: 세 프로젝트 항목이 요청대로 보인다
- 검증 방법: 렌더 확인, 텍스트 검색
- 회귀 테스트: Projects 섹션 grid, 모바일 카드 스택
- 위험도: `LOW`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: 없음

### CR-004

- Change Item ID: `CR-004`
- 사용자 요청 원문: `Gei in touch`의 이메일/깃허브/위치
- 요청 요약: Contact 섹션의 연락처 정보를 요청 값으로 교체
- 요청 분류: `CONTENT`
- 현재 동작: Contact 섹션이 자리표시자다
- 기대 동작: 이메일, 깃허브, 위치가 요청 값으로 표시된다
- 재현 방법: Contact 섹션을 확인한다
- 근거 자료: 사용자 수정 요청 원문
- 수정 대상 기능: Contact 콘텐츠
- 예상 수정 파일: `index.html`
- 변경 허용 범위: 연락처 텍스트
- 변경 금지 범위: 사이트 구조 대폭 변경, 링크 구조 무작위 변경
- 선행 작업: CR-001, CR-002, CR-003과 독립
- 후속 작업: 전체 콘텐츠 회귀 확인
- 다른 Change Item과의 의존성: 없음
- 완료 기준: 이메일 `n86718671@google.com`, 깃허브 `n8671`, 위치 `대한민국 수원시`가 표시됨
- 검증 방법: 렌더 확인, 텍스트 검색
- 회귀 테스트: Contact 레이아웃, 모바일 카드 간격
- 위험도: `LOW`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: "Gei in touch" 표기 유지 여부 `[사람 확인 필요]`

### CR-005

- Change Item ID: `CR-005`
- 사용자 요청 원문: `Pause 누르면, 뱀의 위치가 그대로여야 하는데, 백그라운드에서 뱀이 계속 이동하게 되는 것 같습니다. Pause 후 시간이 좀 흐른 상태에서 Resume 을 하면 뱀에 벽에 충돌합니다.`
- 요청 요약: Pause 중 게임 진행이 멈추고 Resume 시 누적 시간으로 충돌하지 않도록 수정
- 요청 분류: `BUG`, `GAME_STATE`, `GAME_LOGIC`
- 현재 동작: Pause 상태에서도 백그라운드 시간 누적 가능성이 있고 Resume 시 즉시 벽 충돌 가능성이 있다
- 기대 동작: Pause 중 위치와 시간 진행이 멈추고 Resume 후 자연스럽게 이어진다
- 재현 방법: 게임 시작 후 Pause, 대기, Resume
- 근거 자료: 사용자 수정 요청 원문, 현재 `game.js`
- 수정 대상 기능: 게임 상태/타이머
- 예상 수정 파일: `game.js`
- 변경 허용 범위: 상태 변수, 타이머 로직, pause/resume 처리
- 변경 금지 범위: 게임 전체 재작성, UI 대규모 변경
- 선행 작업: 현재 타이머/루프 상태 추적
- 후속 작업: CR-006, CR-007 회귀 확인
- 다른 Change Item과의 의존성: CR-006, CR-007과 일부 공통 회귀 가능
- 완료 기준: Pause 후 뱀 위치가 멈추고 Resume 시 즉시 충돌하지 않음
- 검증 방법: 모의 DOM + 브라우저 재현
- 회귀 테스트: 시작/재시작, 점수 증가, 벽 충돌
- 위험도: `HIGH`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: 없음

### CR-006

- Change Item ID: `CR-006`
- 사용자 요청 원문: `마우스로 게임의 버튼을 클릭하면 뱀이 사라집니다.`
- 요청 요약: 마우스 클릭 입력 후 게임 오브젝트가 사라지지 않게 수정
- 요청 분류: `BUG`, `GAME_CONTROL`
- 현재 동작: 버튼 클릭 입력 경로에서 게임 상태가 깨질 가능성이 있다
- 기대 동작: 마우스 버튼 클릭 후에도 지렁이가 정상 표시되고 방향만 바뀐다
- 재현 방법: 게임 실행 후 화면 방향 버튼을 마우스로 클릭
- 근거 자료: 사용자 수정 요청 원문, 현재 `game.js`
- 수정 대상 기능: 모바일/마우스 입력 처리
- 예상 수정 파일: `game.js`, 필요 시 `index.html`
- 변경 허용 범위: 입력 정규화, 버튼 이벤트 처리
- 변경 금지 범위: 전체 게임 재설계, 불필요한 UI 교체
- 선행 작업: 현재 pointer/button 입력 경로 확인
- 후속 작업: CR-005, CR-007 회귀 확인
- 다른 Change Item과의 의존성: CR-005와 회귀 연관 가능
- 완료 기준: 마우스 클릭 후 지렁이가 사라지지 않음
- 검증 방법: 브라우저 수동 검증
- 회귀 테스트: 키보드 입력, Pause/Restart, 점수 유지
- 위험도: `HIGH`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: 없음

### CR-007

- Change Item ID: `CR-007`
- 사용자 요청 원문: `WASD 키보드 입력이 동작하지 않습니다.`
- 요청 요약: WASD 키 입력이 방향 전환으로 동작하도록 수정
- 요청 분류: `BUG`, `GAME_CONTROL`
- 현재 동작: WASD 입력이 브라우저에서 기대대로 동작하지 않을 수 있다
- 기대 동작: W/A/S/D가 방향키와 동일하게 게임을 제어한다
- 재현 방법: 게임 실행 후 WASD 입력
- 근거 자료: 사용자 수정 요청 원문, 현재 `game.js`
- 수정 대상 기능: 키보드 입력 처리
- 예상 수정 파일: `game.js`
- 변경 허용 범위: keydown 매핑, 이벤트 기본 동작 방지
- 변경 금지 범위: 다른 입력 경로 제거, 게임 전체 재작성
- 선행 작업: 입력 포커스/keydown 경로 확인
- 후속 작업: CR-005, CR-006 회귀 확인
- 다른 Change Item과의 의존성: 없음
- 완료 기준: WASD가 방향키와 동일하게 동작함
- 검증 방법: 브라우저 수동 검증
- 회귀 테스트: 방향키 입력, Pause/Restart, 모바일 버튼
- 위험도: `HIGH`
- 배포 필요 여부: 아니오
- 사람 확인 필요 항목: 없음

## Loop Plan

### Loop-001

- 연결된 Change Item: `CR-005`
- Target: Pause 중 게임 진행과 시간 누적을 멈추고 Resume 시 자연스럽게 재개
- 입력 자료: 현재 `game.js`, 사용자 버그 보고, 브라우저 재현
- Act: 타이머/상태 전이를 수정
- Observe: Pause 후 대기, Resume 시 위치/충돌 여부
- Reason: `GAME_STATE`, `GAME_LOGIC`
- Verifier: 모의 DOM 스모크 + 브라우저 재현
- 완료 기준: Pause 후 지렁이가 멈추고 Resume 후 즉시 충돌하지 않음
- Retry 정책: 동일 오류 최대 3회
- Stop 조건: 동일 fingerprint 2회 반복, 타이머 상태 불일치, HITL 필요
- HITL 조건: 없음
- 예상 수정 파일: `game.js`
- 선행 Loop: 없음
- 다음 Loop: `Loop-002`
- 상태: `CHANGE_PLANNED`
- 실행 상태: `PASSED`

### Loop-002

- 연결된 Change Item: `CR-006`
- Target: 마우스 버튼 클릭 시 지렁이 소실 문제 수정
- 입력 자료: 현재 `game.js`, `index.html`, 브라우저 재현
- Act: 마우스/버튼 입력 경로 정규화
- Observe: 버튼 클릭 후 캔버스와 상태 유지
- Reason: `GAME_CONTROL`
- Verifier: 브라우저 수동 검증
- 완료 기준: 방향 버튼 클릭 시 지렁이가 사라지지 않음
- Retry 정책: 동일 오류 최대 3회
- Stop 조건: 동일 fingerprint 2회 반복, 입력 경로 재현 불가
- HITL 조건: 없음
- 예상 수정 파일: `game.js`, 필요 시 `index.html`
- 선행 Loop: `Loop-001`
- 다음 Loop: `Loop-003`
- 상태: `CHANGE_PLANNED`
- 실행 상태: `PASSED`

### Loop-003

- 연결된 Change Item: `CR-007`
- Target: WASD 키 입력 복구
- 입력 자료: 현재 `game.js`, 브라우저 재현
- Act: keydown 매핑과 기본 동작 차단 확인
- Observe: W/A/S/D 입력 후 방향 변화
- Reason: `GAME_CONTROL`
- Verifier: 브라우저 수동 검증
- 완료 기준: WASD가 방향키와 동일하게 동작함
- Retry 정책: 동일 오류 최대 3회
- Stop 조건: 동일 fingerprint 2회 반복
- HITL 조건: 없음
- 예상 수정 파일: `game.js`
- 선행 Loop: `Loop-002`
- 다음 Loop: `Loop-004`
- 상태: `CHANGE_PLANNED`

### Loop-004

- 연결된 Change Item: `CR-001`, `CR-002`, `CR-003`, `CR-004`
- Target: 프로필/경력/프로젝트/연락처 콘텐츠를 사용자 제공 사실로 교체
- 입력 자료: 사용자 수정 요청 원문
- Act: 콘텐츠 텍스트만 최소 수정
- Observe: 각 섹션 표시 문구
- Reason: `CONTENT`
- Verifier: 텍스트 확인
- 완료 기준: 요청된 값이 각 섹션에 정확히 보임
- Retry 정책: 동일 오류 최대 3회
- Stop 조건: 사실 확인 필요 정보가 발생하면 HITL
- HITL 조건: `Gei in touch` 표기 확정 필요 시
- 예상 수정 파일: `index.html`
- 선행 Loop: `Loop-003`
- 다음 Loop: 없음
- 상태: `CHANGE_PLANNED`
- 실행 상태: `PASSED`

## 실행 순서

1. `Loop-001`
2. `Loop-002`
3. `Loop-003`
4. `Loop-004`

## 분류

- `CR-001`: `CONTENT`
- `CR-002`: `CONTENT`
- `CR-003`: `CONTENT`
- `CR-004`: `CONTENT`
- `CR-005`: `BUG`, `GAME_STATE`, `GAME_LOGIC`
- `CR-006`: `BUG`, `GAME_CONTROL`
- `CR-007`: `BUG`, `GAME_CONTROL`

## 사람 확인 필요 항목

- `Gei in touch`를 정확히 어떤 표기로 유지할지 `[사람 확인 필요]`
- 마지막 정상 배포 URL `[사람 확인 필요]`
