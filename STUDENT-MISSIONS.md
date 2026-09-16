# 학생 실습 — GitHub Actions 전체 시스템 추적

이번 실습은 CSS를 꾸미는 활동이 아니다. Workflow와 API 데이터 수집 부분은 일부러 미완성 상태다. Notion 안내에 따라 TODO를 채우면서 각 단계가 필요한 이유를 설명한다.

## API·JSON TODO

**수정 파일: `scripts/pull-pokemon.mjs`**

이 파일에서 다음 세 부분을 완성한다.

- `TODO-API-1`: PokéAPI 주소와 `fetch`
- `TODO-API-2`: 응답을 JSON 객체로 변환
- `TODO-API-3`: 컬렉션 객체를 JSON 문자열로 저장

나머지 무작위 선택, 등급 계산, 중복 합성 코드는 미리 제공된다.

## TODO-1 실행 조건

**수정 파일: `.github/workflows/update-pokemon.yml`**

`.github/workflows/update-pokemon.yml`의 `on`을 찾는다.

- `workflow_dispatch`: Actions 화면에서 수동 실행
- `schedule`: 예약 실행
- `cron: "*/10 * * * *"`: 10분 간격

## TODO-2 권한

**수정 파일: `.github/workflows/update-pokemon.yml`**

- `contents: write`: JSON과 README 자동 커밋
- `pages: write`: GitHub Pages 배포
- `id-token: write`: Pages 배포 인증

미리 적힌 `contents: read`를 삭제하고 세 권한을 작성한다.

## TODO-3 Runner

**확인 파일: `.github/workflows/update-pokemon.yml`**

`runs-on: ubuntu-latest`는 GitHub가 준비한 Ubuntu 가상 컴퓨터에서 Job을 실행한다는 뜻이다.

## TODO-4 Checkout

**수정 파일: `.github/workflows/update-pokemon.yml`**

새 Runner는 빈 컴퓨터다. `actions/checkout@v4`가 저장소 코드를 Runner 작업 공간으로 가져온다.

임시 `echo` Step을 checkout Step으로 교체한다.

## TODO-5 API 프로그램

**수정 파일: `.github/workflows/update-pokemon.yml`**

```yaml
run: node scripts/pull-pokemon.mjs
```

Node.js가 스크립트를 실행한다. 스크립트는 PokéAPI를 호출하고 `collection.json`과 README를 수정한다.

## TODO-6 자동 커밋

**수정 파일: `.github/workflows/update-pokemon.yml`**

```bash
git add data/collection.json README.md
git commit -m "자동 뽑기 결과"
git push
```

- `git add`: 기록할 파일 선택
- `git commit`: 변경 기록 생성
- `git push`: GitHub 저장소에 기록 전송

## TODO-7 Pages 배포

**수정 파일: `.github/workflows/update-pokemon.yml`**

- `actions/configure-pages`: Pages 환경 설정
- `actions/upload-pages-artifact`: 사이트 파일 업로드
- `actions/deploy-pages`: 실제 사이트 배포

## 실행 순서

1. 시작 코드를 새 공개 저장소에 업로드한다.
2. `Settings → Pages → Source`에서 `GitHub Actions`를 선택한다.
3. 코드를 채우기 전 `Run workflow`를 눌러 TODO 안내만 출력되는지 확인한다.
4. TODO-1부터 TODO-7까지 채우고 커밋한다.
5. 다시 `Run workflow`를 누르고 각 Step의 로그를 확인한다.
6. 자동 커밋과 `data/collection.json` 변경을 확인한다.
7. Pages 주소에서 최근 포켓몬을 확인한다.

## 제출

- Actions 성공 화면
- 자동 커밋 화면
- 변경된 `collection.json`
- GitHub Pages 주소
- TODO-API-1부터 API-3까지의 코드와 설명
- TODO-1부터 TODO-7까지의 설명
