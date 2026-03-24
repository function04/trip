# 여행 플래너 웹 앱

## 프로젝트 개요
노션 대체용 여행 계획 & 가계부 웹 앱. 12일 여행 (약 1년 9개월 후), 2인 (구도현, 김상윤).

## Tech Stack
- **Next.js 16** (App Router, static export) + TypeScript
- **Supabase** (무료 플랜, MCP 연결됨)
- **Tailwind CSS v4** (다크 그레이 노션 스타일, `@theme inline` 사용)
- **recharts** (도넛 차트)
- **배포**: GitHub Pages (`basePath: /trip`)
- **Heartbeat**: GitHub Actions cron 5일마다 → Supabase 무료 플랜 유지

## 페이지 구조
| 경로 | 설명 |
|------|------|
| `/` | 대시보드 (네비 카드 그리드) |
| `/schedule` | 일정 전체 보기 (Day 1~12 그리드) |
| `/schedule/[day]` | Day별 상세 일정 (타임라인) |
| `/expenses` | 가계부 Day 선택 |
| `/expenses/[day]` | Day별 지출 기록 (스마트 입력) |
| `/pre-trip-expenses` | 여행 전 지출 (항공, 숙소, 패스 등) |
| `/summary` | 지출내역합계 (도넛 차트 2개 + 상세 테이블) |
| `/accommodations` | 숙소정보 (Day별) |
| `/checklist` | 준비사항 체크리스트 |
| `/upgrades` | 향후 업그레이드 메모 |

## 핵심 로직
- **스마트 입력** (`src/lib/smartParse.ts`): "커피 3파운드 카드 상윤" → 자동 파싱
- **환율 변환** (`src/lib/currency.ts`): GBP/EUR × 현금/카드 = 4개 환율, 사이드바에서 편집
- **n빵**: 50/50 분배 → 지출합계에서 각자에게 반반 적용
- **카테고리**: 식비, 카페, 지하철, 트램, 버스, 택시, 기차, 숙소, 항공, 티켓, 기념품, 쇼핑, 마트, 통신, 기타

## Supabase 테이블
`exchange_rates`, `schedule_days`, `schedule_items`, `expenses`, `accommodations`, `checklist_items`, `upgrade_notes`, `heartbeat_log`
- 스키마: `supabase-schema.sql` 참고
- RLS: 모두 permissive (개인용 앱)
- MCP로 데이터 CRUD 가능

## 주요 파일
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/lib/smartParse.ts` - 스마트 입력 파싱
- `src/lib/currency.ts` - 환율 변환
- `src/lib/constants.ts` - 카테고리, 인원, 화폐 상수
- `src/components/layout/Sidebar.tsx` - 사이드바 (네비 + 환율)
- `src/components/expenses/ExpenseForm.tsx` - 지출 입력 폼
- `src/components/summary/DonutChart.tsx` - 도넛 차트

## 빌드 & 배포
```bash
npm run dev     # 로컬 개발
npm run build   # 정적 export (out/ 생성)
```
- `.github/workflows/deploy.yml` - main push 시 GitHub Pages 배포
- `.github/workflows/heartbeat.yml` - 5일마다 Supabase ping
- GitHub Secrets 필요: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## 참고
- `[day]` 동적 라우트는 서버 컴포넌트(page.tsx) + 클라이언트 컴포넌트(*Client.tsx) 분리 패턴
- `generateStaticParams`로 Day 1~12 정적 생성
- 모바일 전용 페이지는 아직 미구현 (PC 우선)
