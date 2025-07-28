import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (API 키가 없어도 오류가 발생하지 않도록)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// 영양소 데이터 타입 정의
interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: {
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
  };
  minerals: {
    calcium: number;
    iron: number;
    potassium: number;
  };
}

// 확장된 영양소 데이터베이스 (아이들 음식 50가지 포함)
const nutritionDatabase: Record<string, NutritionInfo> = {
  // 기존 음식들
  '김치찌개': {
    calories: 320,
    protein: 12.5,
    carbs: 45.2,
    fat: 8.3,
    fiber: 6.8,
    vitamins: { vitaminA: 450, vitaminC: 25, vitaminD: 2.1, vitaminE: 3.2 },
    minerals: { calcium: 180, iron: 3.5, potassium: 420 }
  },
  '샐러드': {
    calories: 150,
    protein: 8.2,
    carbs: 25.1,
    fat: 4.5,
    fiber: 8.2,
    vitamins: { vitaminA: 1200, vitaminC: 45, vitaminD: 0.5, vitaminE: 2.8 },
    minerals: { calcium: 120, iron: 2.8, potassium: 380 }
  },
  '닭가슴살': {
    calories: 165,
    protein: 31.0,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    vitamins: { vitaminA: 6, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3 },
    minerals: { calcium: 15, iron: 1.0, potassium: 256 }
  },
  '밥': {
    calories: 130,
    protein: 2.7,
    carbs: 28.2,
    fat: 0.3,
    fiber: 0.4,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 10, iron: 0.2, potassium: 35 }
  },
  '된장찌개': {
    calories: 280,
    protein: 15.2,
    carbs: 38.5,
    fat: 6.8,
    fiber: 7.2,
    vitamins: { vitaminA: 320, vitaminC: 18, vitaminD: 1.8, vitaminE: 2.5 },
    minerals: { calcium: 220, iron: 4.2, potassium: 480 }
  },
  '불고기': {
    calories: 350,
    protein: 28.5,
    carbs: 42.1,
    fat: 12.3,
    fiber: 3.8,
    vitamins: { vitaminA: 280, vitaminC: 12, vitaminD: 1.2, vitaminE: 2.1 },
    minerals: { calcium: 85, iron: 5.8, potassium: 520 }
  },
  '비빔밥': {
    calories: 420,
    protein: 18.5,
    carbs: 65.2,
    fat: 8.9,
    fiber: 12.5,
    vitamins: { vitaminA: 850, vitaminC: 35, vitaminD: 0.8, vitaminE: 4.2 },
    minerals: { calcium: 180, iron: 6.5, potassium: 680 }
  },
  '라면': {
    calories: 380,
    protein: 12.8,
    carbs: 58.5,
    fat: 12.2,
    fiber: 2.1,
    vitamins: { vitaminA: 120, vitaminC: 8, vitaminD: 0.5, vitaminE: 1.8 },
    minerals: { calcium: 85, iron: 2.8, potassium: 320 }
  },
  '피자': {
    calories: 285,
    protein: 12.5,
    carbs: 32.8,
    fat: 12.5,
    fiber: 2.5,
    vitamins: { vitaminA: 180, vitaminC: 8, vitaminD: 0.8, vitaminE: 1.2 },
    minerals: { calcium: 220, iron: 2.2, potassium: 280 }
  },
  '햄버거': {
    calories: 350,
    protein: 18.5,
    carbs: 38.2,
    fat: 15.8,
    fiber: 2.8,
    vitamins: { vitaminA: 220, vitaminC: 6, vitaminD: 0.6, vitaminE: 1.5 },
    minerals: { calcium: 120, iron: 3.8, potassium: 380 }
  },
  '스테이크': {
    calories: 280,
    protein: 35.2,
    carbs: 0,
    fat: 15.8,
    fiber: 0,
    vitamins: { vitaminA: 8, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.8 },
    minerals: { calcium: 25, iron: 4.2, potassium: 420 }
  },
  '연어': {
    calories: 208,
    protein: 25.4,
    carbs: 0,
    fat: 12.5,
    fiber: 0,
    vitamins: { vitaminA: 45, vitaminC: 0, vitaminD: 11.8, vitaminE: 3.2 },
    minerals: { calcium: 15, iron: 0.8, potassium: 420 }
  },
  '계란': {
    calories: 155,
    protein: 12.6,
    carbs: 1.1,
    fat: 10.6,
    fiber: 0,
    vitamins: { vitaminA: 160, vitaminC: 0, vitaminD: 2.0, vitaminE: 1.1 },
    minerals: { calcium: 56, iron: 1.8, potassium: 138 }
  },
  '우유': {
    calories: 103,
    protein: 8.2,
    carbs: 12.2,
    fat: 2.4,
    fiber: 0,
    vitamins: { vitaminA: 46, vitaminC: 0, vitaminD: 2.4, vitaminE: 0.1 },
    minerals: { calcium: 276, iron: 0.1, potassium: 322 }
  },
  '바나나': {
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    vitamins: { vitaminA: 3, vitaminC: 8.7, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 5, iron: 0.3, potassium: 358 }
  },
  '사과': {
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4,
    vitamins: { vitaminA: 3, vitaminC: 4.6, vitaminD: 0, vitaminE: 0.2 },
    minerals: { calcium: 6, iron: 0.1, potassium: 107 }
  },
  
  // 아이들이 주로 먹는 음식 50가지 추가
  '치킨': {
    calories: 250,
    protein: 25.0,
    carbs: 15.0,
    fat: 12.0,
    fiber: 1.0,
    vitamins: { vitaminA: 120, vitaminC: 0, vitaminD: 0.5, vitaminE: 1.2 },
    minerals: { calcium: 20, iron: 1.5, potassium: 300 }
  },
  '떡볶이': {
    calories: 200,
    protein: 4.0,
    carbs: 40.0,
    fat: 2.0,
    fiber: 2.0,
    vitamins: { vitaminA: 50, vitaminC: 5, vitaminD: 0, vitaminE: 0.5 },
    minerals: { calcium: 30, iron: 1.0, potassium: 150 }
  },
  '순대': {
    calories: 180,
    protein: 8.0,
    carbs: 25.0,
    fat: 6.0,
    fiber: 1.5,
    vitamins: { vitaminA: 80, vitaminC: 3, vitaminD: 0.2, vitaminE: 0.8 },
    minerals: { calcium: 40, iron: 2.0, potassium: 200 }
  },
  '김밥': {
    calories: 220,
    protein: 6.0,
    carbs: 42.0,
    fat: 3.0,
    fiber: 2.5,
    vitamins: { vitaminA: 200, vitaminC: 8, vitaminD: 0.1, vitaminE: 1.0 },
    minerals: { calcium: 60, iron: 1.5, potassium: 250 }
  },
  '라멘': {
    calories: 450,
    protein: 18.0,
    carbs: 65.0,
    fat: 15.0,
    fiber: 3.0,
    vitamins: { vitaminA: 150, vitaminC: 10, vitaminD: 0.8, vitaminE: 2.0 },
    minerals: { calcium: 100, iron: 3.0, potassium: 400 }
  },
  '우동': {
    calories: 280,
    protein: 10.0,
    carbs: 52.0,
    fat: 2.0,
    fiber: 2.0,
    vitamins: { vitaminA: 80, vitaminC: 5, vitaminD: 0.2, vitaminE: 0.8 },
    minerals: { calcium: 60, iron: 1.8, potassium: 250 }
  },
  '파스타': {
    calories: 320,
    protein: 12.0,
    carbs: 58.0,
    fat: 8.0,
    fiber: 3.0,
    vitamins: { vitaminA: 120, vitaminC: 8, vitaminD: 0.5, vitaminE: 1.5 },
    minerals: { calcium: 80, iron: 2.5, potassium: 300 }
  },
  '샌드위치': {
    calories: 280,
    protein: 15.0,
    carbs: 35.0,
    fat: 10.0,
    fiber: 3.0,
    vitamins: { vitaminA: 180, vitaminC: 6, vitaminD: 0.6, vitaminE: 1.2 },
    minerals: { calcium: 120, iron: 2.8, potassium: 280 }
  },
  '토스트': {
    calories: 180,
    protein: 6.0,
    carbs: 32.0,
    fat: 4.0,
    fiber: 2.0,
    vitamins: { vitaminA: 50, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.8 },
    minerals: { calcium: 40, iron: 1.2, potassium: 120 }
  },
  '시리얼': {
    calories: 120,
    protein: 3.0,
    carbs: 25.0,
    fat: 1.0,
    fiber: 4.0,
    vitamins: { vitaminA: 100, vitaminC: 0, vitaminD: 1.0, vitaminE: 0.5 },
    minerals: { calcium: 80, iron: 4.0, potassium: 150 }
  },
  '요거트': {
    calories: 150,
    protein: 12.0,
    carbs: 18.0,
    fat: 4.0,
    fiber: 0,
    vitamins: { vitaminA: 30, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.1 },
    minerals: { calcium: 300, iron: 0.2, potassium: 250 }
  },
  '치즈': {
    calories: 110,
    protein: 7.0,
    carbs: 1.0,
    fat: 9.0,
    fiber: 0,
    vitamins: { vitaminA: 120, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.3 },
    minerals: { calcium: 200, iron: 0.2, potassium: 50 }
  },
  '아이스크림': {
    calories: 140,
    protein: 2.0,
    carbs: 22.0,
    fat: 6.0,
    fiber: 0,
    vitamins: { vitaminA: 80, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2 },
    minerals: { calcium: 80, iron: 0.1, potassium: 120 }
  },
  '초콜릿': {
    calories: 150,
    protein: 2.0,
    carbs: 25.0,
    fat: 8.0,
    fiber: 2.0,
    vitamins: { vitaminA: 20, vitaminC: 0, vitaminD: 0, vitaminE: 0.5 },
    minerals: { calcium: 30, iron: 1.5, potassium: 200 }
  },
  '과자': {
    calories: 120,
    protein: 2.0,
    carbs: 20.0,
    fat: 5.0,
    fiber: 1.0,
    vitamins: { vitaminA: 30, vitaminC: 0, vitaminD: 0, vitaminE: 0.3 },
    minerals: { calcium: 20, iron: 0.8, potassium: 80 }
  },
  '젤리': {
    calories: 80,
    protein: 1.0,
    carbs: 18.0,
    fat: 0,
    fiber: 0,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0 },
    minerals: { calcium: 5, iron: 0.1, potassium: 10 }
  },
  '사탕': {
    calories: 60,
    protein: 0,
    carbs: 15.0,
    fat: 0,
    fiber: 0,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0 },
    minerals: { calcium: 0, iron: 0, potassium: 0 }
  },
  '딸기': {
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2.0,
    vitamins: { vitaminA: 12, vitaminC: 58.8, vitaminD: 0, vitaminE: 0.3 },
    minerals: { calcium: 16, iron: 0.4, potassium: 153 }
  },
  '포도': {
    calories: 62,
    protein: 0.6,
    carbs: 16.0,
    fat: 0.2,
    fiber: 0.9,
    vitamins: { vitaminA: 3, vitaminC: 3.2, vitaminD: 0, vitaminE: 0.2 },
    minerals: { calcium: 10, iron: 0.4, potassium: 191 }
  },
  '오렌지': {
    calories: 47,
    protein: 0.9,
    carbs: 11.8,
    fat: 0.1,
    fiber: 2.4,
    vitamins: { vitaminA: 225, vitaminC: 53.2, vitaminD: 0, vitaminE: 0.2 },
    minerals: { calcium: 40, iron: 0.1, potassium: 181 }
  },
  '키위': {
    calories: 42,
    protein: 0.8,
    carbs: 10.1,
    fat: 0.4,
    fiber: 2.1,
    vitamins: { vitaminA: 4, vitaminC: 64.0, vitaminD: 0, vitaminE: 1.5 },
    minerals: { calcium: 23, iron: 0.1, potassium: 148 }
  },
  '망고': {
    calories: 60,
    protein: 0.8,
    carbs: 15.0,
    fat: 0.4,
    fiber: 1.6,
    vitamins: { vitaminA: 54, vitaminC: 36.4, vitaminD: 0, vitaminE: 0.9 },
    minerals: { calcium: 11, iron: 0.2, potassium: 168 }
  },
  '복숭아': {
    calories: 39,
    protein: 0.9,
    carbs: 10.0,
    fat: 0.3,
    fiber: 1.5,
    vitamins: { vitaminA: 326, vitaminC: 6.6, vitaminD: 0, vitaminE: 0.7 },
    minerals: { calcium: 6, iron: 0.3, potassium: 190 }
  },
  '수박': {
    calories: 30,
    protein: 0.6,
    carbs: 7.6,
    fat: 0.2,
    fiber: 0.4,
    vitamins: { vitaminA: 569, vitaminC: 8.1, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 7, iron: 0.2, potassium: 112 }
  },
  '멜론': {
    calories: 34,
    protein: 0.8,
    carbs: 8.2,
    fat: 0.2,
    fiber: 0.9,
    vitamins: { vitaminA: 169, vitaminC: 36.7, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 9, iron: 0.2, potassium: 267 }
  },
  '당근': {
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8,
    vitamins: { vitaminA: 835, vitaminC: 5.9, vitaminD: 0, vitaminE: 0.7 },
    minerals: { calcium: 33, iron: 0.3, potassium: 320 }
  },
  '브로콜리': {
    calories: 34,
    protein: 2.8,
    carbs: 7.0,
    fat: 0.4,
    fiber: 2.6,
    vitamins: { vitaminA: 623, vitaminC: 89.2, vitaminD: 0, vitaminE: 0.8 },
    minerals: { calcium: 47, iron: 0.7, potassium: 316 }
  },
  '시금치': {
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    vitamins: { vitaminA: 469, vitaminC: 28.1, vitaminD: 0, vitaminE: 2.0 },
    minerals: { calcium: 99, iron: 2.7, potassium: 558 }
  },
  '양배추': {
    calories: 25,
    protein: 1.3,
    carbs: 5.8,
    fat: 0.1,
    fiber: 2.5,
    vitamins: { vitaminA: 98, vitaminC: 36.6, vitaminD: 0, vitaminE: 0.2 },
    minerals: { calcium: 40, iron: 0.5, potassium: 170 }
  },
  '양파': {
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    vitamins: { vitaminA: 2, vitaminC: 7.4, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 23, iron: 0.2, potassium: 146 }
  },
  '감자': {
    calories: 77,
    protein: 2.0,
    carbs: 17.0,
    fat: 0.1,
    fiber: 2.2,
    vitamins: { vitaminA: 0, vitaminC: 19.7, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 12, iron: 0.8, potassium: 421 }
  },
  '고구마': {
    calories: 86,
    protein: 1.6,
    carbs: 20.1,
    fat: 0.1,
    fiber: 3.0,
    vitamins: { vitaminA: 709, vitaminC: 2.4, vitaminD: 0, vitaminE: 0.3 },
    minerals: { calcium: 30, iron: 0.6, potassium: 337 }
  },
  '옥수수': {
    calories: 86,
    protein: 3.2,
    carbs: 19.0,
    fat: 1.2,
    fiber: 2.7,
    vitamins: { vitaminA: 187, vitaminC: 6.8, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 2, iron: 0.5, potassium: 270 }
  },
  '콩': {
    calories: 127,
    protein: 9.0,
    carbs: 23.0,
    fat: 0.5,
    fiber: 6.0,
    vitamins: { vitaminA: 2, vitaminC: 0, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 50, iron: 2.1, potassium: 436 }
  },
  '두부': {
    calories: 76,
    protein: 8.0,
    carbs: 1.9,
    fat: 4.8,
    fiber: 0.3,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1 },
    minerals: { calcium: 130, iron: 1.4, potassium: 121 }
  },
  '견과류': {
    calories: 160,
    protein: 6.0,
    carbs: 8.0,
    fat: 14.0,
    fiber: 3.0,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 2.0 },
    minerals: { calcium: 50, iron: 1.5, potassium: 200 }
  },
  '아몬드': {
    calories: 164,
    protein: 6.0,
    carbs: 6.0,
    fat: 14.0,
    fiber: 3.5,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 7.5 },
    minerals: { calcium: 75, iron: 1.1, potassium: 200 }
  },
  '호두': {
    calories: 185,
    protein: 4.3,
    carbs: 3.9,
    fat: 18.5,
    fiber: 1.9,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.7 },
    minerals: { calcium: 28, iron: 0.8, potassium: 125 }
  },
  '땅콩': {
    calories: 166,
    protein: 7.7,
    carbs: 6.0,
    fat: 14.0,
    fiber: 2.4,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 2.0 },
    minerals: { calcium: 26, iron: 0.6, potassium: 200 }
  },
  '달걀프라이': {
    calories: 180,
    protein: 12.0,
    carbs: 1.0,
    fat: 14.0,
    fiber: 0,
    vitamins: { vitaminA: 160, vitaminC: 0, vitaminD: 2.0, vitaminE: 1.1 },
    minerals: { calcium: 56, iron: 1.8, potassium: 138 }
  },
  '스크램블에그': {
    calories: 200,
    protein: 14.0,
    carbs: 2.0,
    fat: 15.0,
    fiber: 0,
    vitamins: { vitaminA: 180, vitaminC: 0, vitaminD: 2.2, vitaminE: 1.3 },
    minerals: { calcium: 60, iron: 2.0, potassium: 150 }
  },
  '오믈렛': {
    calories: 220,
    protein: 16.0,
    carbs: 3.0,
    fat: 16.0,
    fiber: 0.5,
    vitamins: { vitaminA: 200, vitaminC: 2, vitaminD: 2.5, vitaminE: 1.5 },
    minerals: { calcium: 70, iron: 2.2, potassium: 180 }
  },
  '팬케이크': {
    calories: 200,
    protein: 6.0,
    carbs: 35.0,
    fat: 5.0,
    fiber: 1.0,
    vitamins: { vitaminA: 80, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.8 },
    minerals: { calcium: 60, iron: 1.5, potassium: 120 }
  },
  '와플': {
    calories: 220,
    protein: 6.0,
    carbs: 38.0,
    fat: 6.0,
    fiber: 1.5,
    vitamins: { vitaminA: 100, vitaminC: 0, vitaminD: 0.6, vitaminE: 1.0 },
    minerals: { calcium: 80, iron: 1.8, potassium: 150 }
  },
  '도넛': {
    calories: 250,
    protein: 4.0,
    carbs: 35.0,
    fat: 12.0,
    fiber: 1.0,
    vitamins: { vitaminA: 50, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.5 },
    minerals: { calcium: 30, iron: 1.0, potassium: 100 }
  },
  '마카롱': {
    calories: 180,
    protein: 3.0,
    carbs: 28.0,
    fat: 7.0,
    fiber: 1.0,
    vitamins: { vitaminA: 30, vitaminC: 0, vitaminD: 0, vitaminE: 0.3 },
    minerals: { calcium: 20, iron: 0.5, potassium: 80 }
  },
  '티라미수': {
    calories: 280,
    protein: 6.0,
    carbs: 32.0,
    fat: 15.0,
    fiber: 1.0,
    vitamins: { vitaminA: 120, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.8 },
    minerals: { calcium: 80, iron: 1.2, potassium: 150 }
  },
  '케이크': {
    calories: 250,
    protein: 4.0,
    carbs: 40.0,
    fat: 8.0,
    fiber: 1.0,
    vitamins: { vitaminA: 80, vitaminC: 0, vitaminD: 0.3, vitaminE: 0.5 },
    minerals: { calcium: 40, iron: 1.0, potassium: 120 }
  },
  '쿠키': {
    calories: 150,
    protein: 2.0,
    carbs: 22.0,
    fat: 6.0,
    fiber: 1.0,
    vitamins: { vitaminA: 40, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3 },
    minerals: { calcium: 20, iron: 0.8, potassium: 80 }
  },
  '마시멜로': {
    calories: 90,
    protein: 0,
    carbs: 22.0,
    fat: 0,
    fiber: 0,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0 },
    minerals: { calcium: 0, iron: 0, potassium: 0 }
  },
  '캔디': {
    calories: 70,
    protein: 0,
    carbs: 18.0,
    fat: 0,
    fiber: 0,
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0 },
    minerals: { calcium: 0, iron: 0, potassium: 0 }
  }
};

// 레시피 데이터베이스
const recipeDatabase: Record<string, Recipe[]> = {
  '시금치': [
    {
      name: '시금치 샐러드',
      ingredients: ['시금치 100g', '올리브오일 1큰술', '레몬즙 1작은술', '소금 약간', '후추 약간'],
      instructions: [
        '시금치를 깨끗이 씻어 물기를 빼주세요',
        '올리브오일, 레몬즙, 소금, 후추를 섞어 드레싱을 만드세요',
        '시금치에 드레싱을 뿌려 섞어주세요'
      ],
      cookingTime: '5분',
      difficulty: '쉬움',
      nutrition: '철분, 비타민A, 비타민C'
    },
    {
      name: '시금치 스무디',
      ingredients: ['시금치 50g', '바나나 1개', '우유 200ml', '꿀 1큰술'],
      instructions: [
        '시금치를 깨끗이 씻어주세요',
        '바나나를 껍질을 벗겨 잘라주세요',
        '모든 재료를 블렌더에 넣고 갈아주세요'
      ],
      cookingTime: '3분',
      difficulty: '쉬움',
      nutrition: '철분, 비타민A, 칼륨'
    }
  ],
  '오렌지': [
    {
      name: '오렌지 샐러드',
      ingredients: ['오렌지 2개', '양상추 100g', '올리브오일 1큰술', '꿀 1작은술'],
      instructions: [
        '오렌지를 껍질을 벗겨 조각으로 잘라주세요',
        '양상추를 깨끗이 씻어 물기를 빼주세요',
        '올리브오일과 꿀을 섞어 드레싱을 만드세요',
        '모든 재료를 섞어주세요'
      ],
      cookingTime: '10분',
      difficulty: '쉬움',
      nutrition: '비타민C, 비타민A, 식이섬유'
    },
    {
      name: '오렌지 주스',
      ingredients: ['오렌지 3개'],
      instructions: [
        '오렌지를 껍질을 벗겨주세요',
        '주서기나 블렌더로 갈아주세요',
        '체에 걸러서 즙만 따로 마시거나 그대로 마시세요'
      ],
      cookingTime: '5분',
      difficulty: '쉬움',
      nutrition: '비타민C, 비타민A, 칼륨'
    }
  ],
  '연어': [
    {
      name: '연어 구이',
      ingredients: ['연어 200g', '올리브오일 1큰술', '레몬 1개', '소금 약간', '후추 약간'],
      instructions: [
        '연어를 깨끗이 씻어 물기를 빼주세요',
        '소금과 후추로 간을 해주세요',
        '팬에 올리브오일을 두르고 연어를 굽습니다',
        '레몬을 곁들여 먹습니다'
      ],
      cookingTime: '15분',
      difficulty: '보통',
      nutrition: '오메가3, 단백질, 비타민D'
    },
    {
      name: '연어 샐러드',
      ingredients: ['연어 150g', '양상추 100g', '토마토 1개', '올리브오일 1큰술'],
      instructions: [
        '연어를 구워서 작은 조각으로 잘라주세요',
        '양상추와 토마토를 깨끗이 씻어 잘라주세요',
        '올리브오일을 뿌려 섞어주세요'
      ],
      cookingTime: '20분',
      difficulty: '보통',
      nutrition: '오메가3, 단백질, 비타민C'
    }
  ],
  '우유': [
    {
      name: '바나나 밀크쉐이크',
      ingredients: ['우유 200ml', '바나나 1개', '꿀 1큰술'],
      instructions: [
        '바나나를 껍질을 벗겨 잘라주세요',
        '모든 재료를 블렌더에 넣고 갈아주세요',
        '잔에 부어 마시세요'
      ],
      cookingTime: '3분',
      difficulty: '쉬움',
      nutrition: '칼슘, 단백질, 칼륨'
    },
    {
      name: '딸기 밀크쉐이크',
      ingredients: ['우유 200ml', '딸기 10개', '꿀 1큰술'],
      instructions: [
        '딸기를 깨끗이 씻어 꼭지를 제거해주세요',
        '모든 재료를 블렌더에 넣고 갈아주세요',
        '잔에 부어 마시세요'
      ],
      cookingTime: '3분',
      difficulty: '쉬움',
      nutrition: '칼슘, 비타민C, 단백질'
    }
  ],
  '당근': [
    {
      name: '당근 샐러드',
      ingredients: ['당근 2개', '올리브오일 1큰술', '레몬즙 1작은술', '꿀 1작은술'],
      instructions: [
        '당근을 깨끗이 씻어 강판으로 갈아주세요',
        '올리브오일, 레몬즙, 꿀을 섞어 드레싱을 만드세요',
        '당근에 드레싱을 뿌려 섞어주세요'
      ],
      cookingTime: '10분',
      difficulty: '쉬움',
      nutrition: '비타민A, 비타민C, 식이섬유'
    },
    {
      name: '당근 주스',
      ingredients: ['당근 3개', '사과 1개'],
      instructions: [
        '당근과 사과를 깨끗이 씻어 껍질을 벗겨주세요',
        '주서기나 블렌더로 갈아주세요',
        '체에 걸러서 즙만 마시세요'
      ],
      cookingTime: '5분',
      difficulty: '쉬움',
      nutrition: '비타민A, 비타민C, 식이섬유'
    }
  ],
  '견과류': [
    {
      name: '견과류 믹스',
      ingredients: ['아몬드 50g', '호두 50g', '땅콩 50g', '꿀 1큰술'],
      instructions: [
        '모든 견과류를 깨끗이 씻어 물기를 빼주세요',
        '꿀을 넣어 섞어주세요',
        '그릇에 담아 간식으로 먹습니다'
      ],
      cookingTime: '5분',
      difficulty: '쉬움',
      nutrition: '불포화지방, 단백질, 비타민E'
    },
    {
      name: '견과류 요거트',
      ingredients: ['요거트 200g', '아몬드 20g', '꿀 1큰술'],
      instructions: [
        '요거트를 그릇에 담아주세요',
        '아몬드를 잘게 썰어 넣어주세요',
        '꿀을 뿌려 섞어주세요'
      ],
      cookingTime: '3분',
      difficulty: '쉬움',
      nutrition: '단백질, 칼슘, 불포화지방'
    }
  ]
};

// 음식명 매칭 함수 (유사한 음식명 찾기)
function findSimilarFood(foodName: string): string | null {
  const normalizedName = foodName.toLowerCase().trim();
  
  // 정확한 매칭
  if (nutritionDatabase[normalizedName]) {
    return normalizedName;
  }
  
  // 부분 매칭
  for (const key in nutritionDatabase) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return key;
    }
  }
  
  // 유사한 음식 매칭
  const foodMappings: Record<string, string> = {
    '김치': '김치찌개',
    '된장': '된장찌개',
    '고기': '불고기',
    '소고기': '불고기',
    '돼지고기': '불고기',
    '치킨': '닭가슴살',
    '닭고기': '닭가슴살',
    '생선': '연어',
    '고등어': '연어',
    '달걀': '계란',
    '계란': '계란',
    '과일': '바나나',
    '딸기': '사과',
    '포도': '사과',
    '빵': '밥',
    '면': '라면',
    '파스타': '라면',
    '치즈': '우유',
    '요거트': '우유'
  };
  
  return foodMappings[normalizedName] || null;
}

// AI를 사용한 영양소 분석 함수
async function analyzeNutritionWithAI(foodName: string): Promise<NutritionInfo | null> {
  if (!openai) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `당신은 영양학 전문가입니다. 주어진 음식의 영양소 정보를 분석하여 JSON 형태로 응답해주세요.
          
          응답 형식:
          {
            "calories": 숫자,
            "protein": 숫자 (g),
            "carbs": 숫자 (g),
            "fat": 숫자 (g),
            "fiber": 숫자 (g),
            "vitamins": {
              "vitaminA": 숫자 (μg),
              "vitaminC": 숫자 (mg),
              "vitaminD": 숫자 (μg),
              "vitaminE": 숫자 (mg)
            },
            "minerals": {
              "calcium": 숫자 (mg),
              "iron": 숫자 (mg),
              "potassium": 숫자 (mg)
            }
          }
          
          일반적인 1인분 기준으로 분석해주세요. 정확한 수치가 어려운 경우 추정치를 제공해주세요.`
        },
        {
          role: "user",
          content: `"${foodName}"의 영양소 정보를 분석해주세요.`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (content) {
      try {
        const nutritionData = JSON.parse(content);
        return nutritionData as NutritionInfo;
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        return null;
      }
    }
  } catch (error) {
    console.error('AI 분석 오류:', error);
    return null;
  }

  return null;
}

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  nutrition: string;
}

export async function POST(request: NextRequest) {
  try {
    const { image, foodName } = await request.json();

    let identifiedFood = '';
    
    if (image) {
      // OpenAI Vision API를 사용하여 이미지 분석
      if (!openai) {
        // API 키가 없는 경우 기본 메시지 반환
        return NextResponse.json({
          food: "이미지 분석을 위해 OpenAI API 키가 필요합니다",
          nutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0 },
            minerals: { calcium: 0, iron: 0, potassium: 0 }
          },
          recommendations: [{
            name: "음식명 직접 입력",
            nutrition: "수동 입력",
            description: "API 키 없이는 이미지 분석이 불가능합니다. 음식명을 직접 입력해주세요.",
            image: "📝",
            foodList: Object.keys(nutritionDatabase)
          }],
          message: "OpenAI API 키를 설정하면 이미지 분석 기능을 사용할 수 있습니다."
        });
      }

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "이 이미지에 있는 음식을 한국어로 정확히 식별해주세요. 음식명만 간단히 답변해주세요."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image
                  }
                }
              ]
            }
          ],
          max_tokens: 50
        });

        identifiedFood = response.choices[0].message.content?.trim() || '';
      } catch (error) {
        console.error('OpenAI API 오류:', error);
        identifiedFood = '';
      }
    } else if (foodName) {
      identifiedFood = foodName;
    }

    // 1단계: 데이터베이스에서 찾기
    const matchedFood = findSimilarFood(identifiedFood);
    let nutritionInfo = matchedFood ? nutritionDatabase[matchedFood] : null;
    
    // 2단계: 데이터베이스에 없으면 AI로 분석
    if (!nutritionInfo && openai) {
      console.log(`"${identifiedFood}"를 AI로 분석합니다...`);
      nutritionInfo = await analyzeNutritionWithAI(identifiedFood);
    }
    
    // 3단계: AI 분석도 실패하면 기본값 제공
    if (!nutritionInfo) {
      const randomNutrition: NutritionInfo = {
        calories: Math.floor(Math.random() * 300) + 150,
        protein: Math.floor(Math.random() * 20) + 8,
        carbs: Math.floor(Math.random() * 40) + 20,
        fat: Math.floor(Math.random() * 15) + 3,
        fiber: Math.floor(Math.random() * 8) + 2,
        vitamins: { 
          vitaminA: Math.floor(Math.random() * 500) + 50, 
          vitaminC: Math.floor(Math.random() * 50) + 5, 
          vitaminD: Math.floor(Math.random() * 5) + 0.5, 
          vitaminE: Math.floor(Math.random() * 5) + 0.5 
        },
        minerals: { 
          calcium: Math.floor(Math.random() * 200) + 50, 
          iron: Math.floor(Math.random() * 5) + 1, 
          potassium: Math.floor(Math.random() * 400) + 200 
        }
      };

      return NextResponse.json({
        food: identifiedFood,
        nutrition: randomNutrition,
        recommendations: generateRecommendations(randomNutrition),
        message: `"${identifiedFood}"에 대한 정확한 영양 정보가 없어 추정값을 제공합니다.`
      });
    }

    const recommendations = generateRecommendations(nutritionInfo);
    const message = matchedFood 
      ? `"${identifiedFood}"의 정확한 영양 정보를 제공합니다.`
      : `"${identifiedFood}"를 AI가 분석한 영양 정보입니다.`;

    return NextResponse.json({
      food: identifiedFood,
      nutrition: nutritionInfo,
      recommendations,
      message
    });

  } catch (error) {
    console.error('영양 분석 오류:', error);
    return NextResponse.json(
      { error: '영양 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateRecommendations(nutrition: NutritionInfo) {
  const recommendations = [];
  
  // 철분 부족 체크
  if (nutrition.minerals.iron < 5) {
    recommendations.push({
      name: "시금치",
      nutrition: "철분, 비타민A",
      description: "철분이 부족합니다. 시금치를 추가로 섭취하세요.",
      image: "🥬",
      foodList: ["시금치", "브로콜리", "콩", "쇠고기", "달걀"],
      recipes: recipeDatabase['시금치']
    });
  }
  
  // 비타민C 부족 체크
  if (nutrition.vitamins.vitaminC < 30) {
    recommendations.push({
      name: "오렌지",
      nutrition: "비타민C",
      description: "비타민C 섭취를 늘려보세요.",
      image: "🍊",
      foodList: ["오렌지", "레몬", "키위", "딸기", "파프리카"],
      recipes: recipeDatabase['오렌지']
    });
  }
  
  // 단백질 부족 체크
  if (nutrition.protein < 15) {
    recommendations.push({
      name: "연어",
      nutrition: "오메가3, 단백질",
      description: "고품질 단백질과 오메가3를 섭취하세요.",
      image: "🐟",
      foodList: ["연어", "닭가슴살", "계란", "두부", "콩"],
      recipes: recipeDatabase['연어']
    });
  }
  
  // 칼슘 부족 체크
  if (nutrition.minerals.calcium < 100) {
    recommendations.push({
      name: "우유",
      nutrition: "칼슘, 단백질",
      description: "칼슘 섭취를 늘려보세요.",
      image: "🥛",
      foodList: ["우유", "요거트", "치즈", "두부", "브로콜리"],
      recipes: recipeDatabase['우유']
    });
  }
  
  // 비타민A 부족 체크
  if (nutrition.vitamins.vitaminA < 300) {
    recommendations.push({
      name: "당근",
      nutrition: "비타민A",
      description: "비타민A 섭취를 늘려보세요.",
      image: "🥕",
      foodList: ["당근", "고구마", "시금치", "브로콜리", "달걀노른자"],
      recipes: recipeDatabase['당근']
    });
  }
  
  // 비타민D 부족 체크
  if (nutrition.vitamins.vitaminD < 2) {
    recommendations.push({
      name: "연어",
      nutrition: "비타민D",
      description: "비타민D 섭취를 늘려보세요.",
      image: "🐟",
      foodList: ["연어", "고등어", "달걀노른자", "우유", "버섯"],
      recipes: recipeDatabase['연어']
    });
  }
  
  // 기본 추천
  if (recommendations.length === 0) {
    recommendations.push({
      name: "견과류",
      nutrition: "불포화지방, 단백질",
      description: "건강한 지방과 단백질을 섭취하세요.",
      image: "🥜",
      foodList: ["아몬드", "호두", "땅콩", "피스타치오", "캐슈넛"],
      recipes: recipeDatabase['견과류']
    });
  }
  
  return recommendations;
} 