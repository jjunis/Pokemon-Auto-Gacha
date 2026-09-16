# 포켓몬 자동 가챠 연구소 — 학생용 시작 코드

GitHub Actions가 PokéAPI에서 데이터를 가져와 10분마다 컬렉션을 갱신하고 GitHub Pages에 배포하는 수업용 프로젝트입니다.

화면과 가챠 계산 로직은 미리 제공됩니다. `scripts/pull-pokemon.mjs`의 API·JSON TODO와 `.github/workflows/update-pokemon.yml`의 Actions TODO를 채우면 전체 시스템이 작동합니다. 자세한 순서는 `STUDENT-MISSIONS.md`를 확인하세요.

<!-- AUTO-GACHA:START -->
## 자동 가챠 현황

- 최근 획득: **shellder [N]**
- 종합 능력치: **305**
- 총 뽑기: **2회**
- 보유 종류: **2/1025**
- 마지막 갱신: **2026-09-16T01:47:50.303Z**

<!-- AUTO-GACHA:END -->

## 처음 설정

1. 이 폴더의 파일을 GitHub 공개 저장소에 업로드합니다.
2. `Settings → Pages → Source`를 `GitHub Actions`로 설정합니다.
3. `Actions → Pokemon Auto Gacha → Run workflow`를 실행합니다.
4. 실행이 끝나면 자동 커밋과 Pages 주소를 확인합니다.

## 구조

- `scripts/pull-pokemon.mjs`: API 호출, 등급 계산, 중복 합성, JSON 및 README 갱신
- `data/collection.json`: 컬렉션 데이터
- `.github/workflows/update-pokemon.yml`: 예약 실행, 커밋, 배포 자동화
- `app.js`: 화면과 통계 출력

Pokémon 및 Pokémon 캐릭터 이름은 Nintendo의 상표입니다. 이 저장소는 비상업적 교육용 예제입니다.
