# 📱 MokJang (목장)

**모던 & 미니멀 청년부 커뮤니티 플랫폼**

MokJang은 교회 내 “목장 공동체”를 중심으로 소통, 기도, 말씀, 모임 관리가 자연스럽게 이루어지도록 돕는 모던하고 미니멀한 커뮤니티 앱입니다. 특히 미국 한인 청년부의 니즈를 반영하여 설계되었습니다.

---

## ✨ 주요 기능 (Key Features)

### 🏠 홈 (Home)

- **공지사항**: 교회 전체 소식 및 공지사항을 피드 형태로 확인
- **기도제목**: 공동체 전체와 소통하며 기도제목 공유 및 응답 기록
- **QT / 말씀**: 오늘의 말씀 묵상 및 본문 확인

### 👥 커뮤니티 / 목장 (Community)

- **목장 관리**: 초대 코드 또는 검색을 통한 목장 가입 및 승인 프로세스
- **모임 일정**: 목장 모임의 날짜, 시간, 장소 조율 및 RSVP 기능
- **지도 연동**: 구글 맵 딥링크를 통한 모임 장소 확인
- **프라이빗 소통**: 소속 목원들끼리만 공유하는 기도제목 및 일정 관리

### 📖 성경 통독 (Bible)

- **개인 통독**: 매일의 성경 읽기 현황 체크 및 기록
- **공동체 현황**: 목장별/교회 전체 통독 랭킹 및 통계 (Planned)

### 👤 프로필 & 설정 (Profile)

- **다국어 지원**: 한국어 및 영어 지원 (i18next)
- **테마 설정**: 라이트/다크 모드 및 시스템 설정 자동 연동
- **개인화**: 내 기도제목 히스토리 및 통독 리포트 관리

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [React Native (Expo)](https://expo.dev/)
- **Routing**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind CSS for Native)
- **UI Components**: Gluestack UI, Lucide React Native
- **State Management**: React Query (TanStack Query)
- **Internationalization**: i18next / react-i18next

### Backend & Cloud

- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Security**: Row Level Security (RLS)
- **Functions**: Supabase Edge Functions
- **Storage**: Supabase Storage (Profile images)

---

## 🚀 시작하기 (Getting Started)

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 필요한 Supabase 설정을 입력합니다.

### 3. 앱 실행

```bash
npx expo start
```

---

## 📄 License

This project is private and for church community use.
