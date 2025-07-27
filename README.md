# Nutrition Analysis App

영양 분석 애플리케이션입니다.

## 환경 변수 설정

### OpenAI API 키 설정

1. `.env.local` 파일을 프로젝트 루트에 생성하세요:
```bash
OPENAI_API_KEY=your_actual_openai_api_key_here
```

2. OpenAI API 키를 얻으려면:
   - [OpenAI Platform](https://platform.openai.com/api-keys)에서 계정 생성
   - API 키 생성 후 `.env.local` 파일에 추가

⚠️ **보안 주의사항:**
- `.env.local` 파일은 Git에 올라가지 않습니다 (`.gitignore`에 포함됨)
- API 키를 코드에 직접 하드코딩하지 마세요
- API 키를 공개 저장소에 올리지 마세요

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4 Vision API
- **UI Components**: Headless UI

## 📱 사용 방법

1. **찍찍이의 탐정 활동**: 
   - 사진 촬영/업로드 버튼을 클릭하여 음식 사진을 추가하거나
   - 음식명을 직접 입력하세요

2. **냠냥이의 영양 분석**: 
   - "냠냥이에게 분석 부탁하기" 버튼을 클릭하면 냠냥이가 음식을 분석합니다

3. **결과 확인**: 
   - 냠냥이가 알려주는 상세한 영양 정보를 확인하고
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

---

**제작**: R.OTi Lab  
**기술 스택**: Next.js, React, TypeScript, Tailwind CSS, OpenAI API
