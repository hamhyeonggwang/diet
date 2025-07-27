# 🥗 영양 분석기

AI를 활용한 식생활 교육용 웹 애플리케이션입니다. 음식을 촬영하거나 입력하면 칼로리와 영양소를 분석하고, 부족한 영양소를 보충할 수 있는 음식을 추천해드립니다.

## ✨ 주요 기능

- **📸 음식 이미지 분석**: 사진을 촬영하거나 업로드하여 AI가 음식을 자동으로 식별
- **📝 음식명 직접 입력**: 음식명을 직접 입력하여 영양 정보 조회
- **📊 상세한 영양 분석**: 칼로리, 단백질, 탄수화물, 지방, 비타민, 미네랄 정보 제공
- **💡 개인화된 추천**: 부족한 영양소를 보충할 수 있는 음식 추천
- **🎨 현대적인 UI**: 반응형 디자인과 직관적인 사용자 인터페이스

## 🚀 시작하기

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd nutrition-app
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 OpenAI API 키를 설정하세요:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4 Vision API
- **UI Components**: Headless UI

## 📱 사용 방법

1. **음식 입력**: 
   - 사진 촬영/업로드 버튼을 클릭하여 음식 사진을 추가하거나
   - 음식명을 직접 입력하세요

2. **영양 분석**: 
   - "영양 분석하기" 버튼을 클릭하면 AI가 음식을 분석합니다

3. **결과 확인**: 
   - 상세한 영양 정보를 확인하고
   - 부족한 영양소를 보충할 수 있는 음식 추천을 받으세요

## 🔧 API 설정

이 애플리케이션은 OpenAI Vision API를 사용합니다. API 키를 얻으려면:

1. [OpenAI 웹사이트](https://platform.openai.com/)에 가입
2. API 키 생성
3. `.env.local` 파일에 API 키 추가

## 📊 영양소 데이터

현재 지원하는 음식:
- 김치찌개
- 샐러드
- 닭가슴살
- 밥

더 많은 음식 데이터를 추가하려면 `src/app/api/analyze/route.ts` 파일의 `nutritionDatabase` 객체를 수정하세요.

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.
