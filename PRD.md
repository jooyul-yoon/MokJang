# 📱 MokJang — PRD (Product Requirements Document)

**모던 & 미니멀 청년부 커뮤니티 플랫폼**
_Version 1.0 — Draft_

---

## 1. Overview

### 1.1 App Name

**MokJang**

### 1.2 Purpose

MokJang은 교회 내 “목장 공동체”를 중심으로 소통・기도・말씀・모임 관리가 자연스럽게 이루어지도록 돕는 모던하고 미니멀한 커뮤니티 앱이다.

### 1.3 Target Users

- 미국 한인 청년부 20~30대
- 목자 리더십
- 교회 전체 공동체
- 목장에 처음 참여하는 새가족

### 1.4 Core Value

- **Simple**
- **Modern**
- **Spiritually grounded**
- **Community centered**
- **Minimal friction**

---

## 2. Vision & Goals

### Primary Goal

교회 공동체를 “가깝게” 만들고, 목장 시스템 안에서 기도와 말씀의 흐름을 살아 있게 만드는 플랫폼 구축.

### Secondary Goals

- 청년부 참석률 증가
- 목장 소속감 강화
- 영적 성장 추적 가능
- 기도제목/응답 히스토리 남기기
- 행정·소통 비효율 최소화

---

## 3. Feature Summary (MVP)

| 기능                        | 설명                                    |
| :-------------------------- | :-------------------------------------- |
| **A. 목장 Join/관리**       | 초대 코드/검색/승인 기반 그룹 가입      |
| **B. 일정·장소 조율**       | 목장 모임 일정, 장소, 지도 링크, RSVP   |
| **C. 기도제목 공유**        | 전체/목장/개인 공개범위 + 기도응답 기록 |
| **D. 성경 통독**            | 개별 체크 + 목장/교회 전체 통계 + 랭킹  |
| **E. 공지 / 커뮤니티 피드** | 교회 전체 공지 및 활동 피드             |
| **F. 프로필 / 권한 관리**   | 역할(관리자/목자/목원) + 목장 이동 요청 |

---

## 4. User Roles & Permissions

### 4.1 Guest (새가족 / 가입 전 사용자)

- 교회 전체 공지 보기
- 목장 탐색
- 목장 Join 요청
- 게스트 모드 사용 가능

### 4.2 Member (목원)

- 자신의 목장 콘텐츠 접근
- 기도제목 작성
- 성경통독 체크
- RSVP
- 목장 변경 요청

### 4.3 Leader (목자)

- 목장 공지
- 일정 생성/수정
- 가입 요청 승인
- 목원 기도제목/통독 현황 보기
- 목장 통계 조회

### 4.4 Admin (교역자/부장)

- 모든 목장 접근
- 전체 공지
- 전체 통독/기도 통계 조회
- 목장 생성/수정/삭제
- 역할 부여

---

## 5. Core Features in Detail

### A. 목장 Join Flow

- **Join 방식 3개**:
  - 초대 코드 / QR
  - 목장 리스트에서 선택 → 가입 요청
  - 관리자/목자가 직접 배정
- **상태**:
  - Pending
  - Approved
  - Rejected
  - Left

### B. 목장 일정 & 장소 조율

- **기능**:
  - 날짜/시간/장소/주소
  - 지도(Google Maps Deep Link)
  - 역할 나누기 (찬양 / 간식 / 차량 등)
  - RSVP (참석 / 지각 / 불참 / 미정)
- **자동 리마인더 알림**:
  - 전날 8PM
  - 당일 2시간 전
- **목장 일정 카드 UI**:
  - Title
  - Host
  - Location
  - Map link
  - Description
  - RSVP buttons

### C. 기도제목 시스템

- **작성 요소**:
  - 내용
  - **카테고리 (optional)**: 진로/취업, 학업, 건강, 가정, 관계, 영적상태, 감사, 기타
  - **공개 범위**: 전체 공개, 목장만, 목자만, 개인만(비공개)
  - 익명 여부
  - 응답 체크 + 응답 기록
- **뷰**:
  - 전체 교회 피드
  - 목장 피드
  - 개인별 기도제목 모아보기
  - 응답된 기도제목 아카이브
- **통계 (Admin)**:
  - 최근 한 달 카테고리 비중
  - 전체 기도제목량 변화
  - 응답률

### D. 성경 통독 시스템

- **개인**:
  - 하루 통독 체크 (본인 기록)
  - 한 줄 묵상(optional)
- **목장**:
  - 오늘 읽은 사람 수
  - 주간/월간 통계
  - 완독률
- **전체 교회**:
  - 전체 통독률
  - 오늘의 통독자 수
  - 목장별 통독 랭킹 TOP 3
  - 연간 완독자 표시

### E. 공지 / 교회 피드

- **전체 공지 (Facebook Feed Style)**:
  - 예배/행사 정보
  - 리트릿, 봉사 안내
  - 통독 플랜 업데이트
  - **UI/UX**:
    - 작성자 프로필, 타임스탬프 헤더
    - 본문 내용
    - **Action Buttons**: 읽음(조회수), 댓글, 공유
- **커뮤니티 피드 (옵션)**:
  - 기도제목 하이라이트
  - 메시지/짧은 묵상
  - 이벤트 사진(관리자 only)

### F. 프로필 / 설정

- 이름, 사진
- 목장 정보
- 내 기도제목 리스트
- 내 통독 리포트
- 목장 이동 요청
- Notification 설정
- 다크모드 On/Off/Auto

---

## 6. UI/UX 방향

### Design Language

- **Modern & Minimal**
- Flat UI, 얇은 라인 아이콘
- 그림자 최소
- 라운드 모서리 8~12px
- Apple Human Interface 스타일 반영

### Primary Colors (SET B)

- **Graphite Gray**: `#3D3C42`
- **Stone Gray**: `#9C9CA1`
- **Amber**: `#FFB703`
- **Background**: `#FAFAFA`
- **Text**: `#333333`

### Dark Mode

- **Background**: `#121212`
- **Surface**: `#1E1E1E`
- **Line/Icon**: `#9C9CA1`

### Typography

- Inter
- SF Pro
- Urbanist (optional for headings)

---

## 7. Technical Architecture

### Frontend

- React Native (Expo)
- TypeScript
- Zustand or Recoil for state
- react-navigation
- react-native-reanimated
- react-native-bottom-sheet

### Backend

- Supabase
- Auth
- Postgres DB
- Row Level Security
- Edge Functions

### 3rd Party

- Google Maps Deep Link
- Push Notifications (Expo)
- S3 or Supabase Storage for Profile images

---

## 8. Database Schema

- **profiles**: `id` (uuid, PK), `full_name` (text), `avatar_url` (text), `role` (text: 'member', 'leader', 'admin'), `updated_at` (timestamptz)
- **groups**: `id` (uuid, PK), `name` (text), `description` (text), `leader_id` (uuid, FK), `meeting_time` (text), `meeting_day` (text), `meeting_hour` (time), `region` (text), `created_at` (timestamptz)
- **group_members**: `id` (uuid, PK), `group_id` (uuid, FK), `user_id` (uuid, FK), `role` (text), `status` (text: 'pending', 'approved', 'rejected'), `created_at` (timestamptz)
- **meetings**: `id` (uuid, PK), `group_id` (uuid, FK), `date` (date), `time` (time), `location` (text), `description` (text), `host_id` (uuid, FK), `created_at` (timestamptz)
- **prayer_requests**: `id` (uuid, PK), `user_id` (uuid, FK), `group_id` (uuid, FK), `content` (text), `visibility` (text: 'public', 'group'), `created_at` (timestamptz), `updated_at` (timestamptz)
- **prayer_request_comments**: `id` (uuid, PK), `prayer_request_id` (uuid, FK), `user_id` (uuid, FK), `content` (text), `created_at` (timestamptz)
- **announcements**: `id` (uuid, PK), `title` (text), `content` (text), `author_id` (uuid, FK), `created_at` (timestamptz)
- **announcement_reads**: `id` (uuid, PK), `announcement_id` (uuid, FK), `user_id` (uuid, FK), `created_at` (timestamptz)
- **announcement_comments**: `id` (uuid, PK), `announcement_id` (uuid, FK), `user_id` (uuid, FK), `content` (text), `created_at` (timestamptz)
- **bible_reads** (Planned): `id`, `user_id`, `group_id`, `date`, `range`, `note`
- **group_join_requests** (Legacy): `id`, `user_id`, `group_id`, `status`, `created_at` (group_members 테이블로 통합 권장)

---

## 9. Mobile App Structure (Tabs)

MokJang 모바일 앱은 사용자의 편의성을 위해 4개의 주요 탭으로 구성되어 있습니다.

### 9.1 Home (🏠 홈)

- **공지사항 (Announcements)**: 교회 전체 공지 및 소식을 피드 형태로 확인. 관리자/목자는 공지사항 작성 가능.
- **기도제목 (Prayers)**: 공동체 전체의 기도제목 확인 및 하트/댓글 소통.
- **말씀 묵상 (QT)**: 오늘의 말씀 묵상 및 본문 확인.

### 9.2 Community (👥 커뮤니티 / 목장)

- **목장 미가입 시**: 가입 가능한 목장 리스트 확인 및 가입 신청.
- **목장 가입 시**: 소속 목장 정보(이름, 모임 시간, 지역) 확인.
  - **Meetings (모임)**: 다가오는 목장 모임 일정, 장소(지도 연동), 호스트 정보 확인 및 RSVP.
  - **Prayer Requests (목장 기도제목)**: 목원들끼리만 공유하는 프라이빗 기도제목 관리.
- **목자 권한**: 목장 정보 수정 및 가입 요청 승인/관리 페이지 접근 가능.

### 9.3 Bible (📖 성경)

- **성경 읽기**: 성경 본문 읽기 기능 (준비 중).
- **통독 기록**: 개인별/목장별 성경 통독 현황 체크 및 통계 확인 (Planned).

### 9.4 Profile (👤 프로필)

- **내 정보**: 이름 수정, 프로필 이미지 업로드(Supabase Storage 연동).
- **소속 확인**: 현재 내가 소속된 목장 정보 확인 및 바로가기.
- **설정 (Settings)**:
  - **언어 설정**: 한국어/영어 전환 (i18next).
  - **테마 설정**: 라이트 모드/다크 모드/시스템 설정 연동.
  - **계정 관리**: 로그아웃 및 회원 탈퇴(데이터 삭제).

---

## 10. Success Metrics

### Community Engagement

- 주간 활성 사용자 수(WAU)
- 목장 일정 RSVP 참여율
- 기도제목 생성량

### Spiritual Engagement

- 성경통독 체크율
- 목장별 통독 랭킹 변화
- 기도 응답 기록 수

### Operational Efficiency

- 목장 공지/소통에 소요되는 시간 감소
- 교역자의 통계 조회 활용도

---

## 10. Roadmap

### MVP (0.1–1.0)

- 목장 조인
- 일정/RSVP
- 기도제목 (전체/목장)
- 성경통독 기록
- 프로필
- 다크모드

### Next (1.1–1.5)

- 실시간 채팅(옵션)
- 사진 공유
- 설교 노트
- 목장별 역할 분배
- 교회 Admin Dashboard

### Future (2.0+)

- Multi-church 지원 (SaaS)
- 결제(리트릿, 등록 등)
- AI 성경요약 / 묵상 추천
- AI 기도 응답 분석

---

## 11. 결론

MokJang은 단순한 교회 앱이 아니라, **목장이 중심이 되는 영적 커뮤니티 플랫폼**이다.
이 PRD는 MVP 개발부터 운영 확장까지 충분히 커버하며, 실제 교회 환경과 청년부 니즈를 정확하게 반영하도록 설계되었다.
