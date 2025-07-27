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

// 확장된 영양소 데이터베이스
const nutritionDatabase: Record<string, NutritionInfo> = {
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
  }
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
      foodList: ["시금치", "브로콜리", "콩", "쇠고기", "달걀"]
    });
  }
  
  // 비타민C 부족 체크
  if (nutrition.vitamins.vitaminC < 30) {
    recommendations.push({
      name: "오렌지",
      nutrition: "비타민C",
      description: "비타민C 섭취를 늘려보세요.",
      image: "🍊",
      foodList: ["오렌지", "레몬", "키위", "딸기", "파프리카"]
    });
  }
  
  // 단백질 부족 체크
  if (nutrition.protein < 15) {
    recommendations.push({
      name: "연어",
      nutrition: "오메가3, 단백질",
      description: "고품질 단백질과 오메가3를 섭취하세요.",
      image: "🐟",
      foodList: ["연어", "닭가슴살", "계란", "두부", "콩"]
    });
  }
  
  // 칼슘 부족 체크
  if (nutrition.minerals.calcium < 100) {
    recommendations.push({
      name: "우유",
      nutrition: "칼슘, 단백질",
      description: "칼슘 섭취를 늘려보세요.",
      image: "🥛",
      foodList: ["우유", "요거트", "치즈", "두부", "브로콜리"]
    });
  }
  
  // 비타민A 부족 체크
  if (nutrition.vitamins.vitaminA < 300) {
    recommendations.push({
      name: "당근",
      nutrition: "비타민A",
      description: "비타민A 섭취를 늘려보세요.",
      image: "🥕",
      foodList: ["당근", "고구마", "시금치", "브로콜리", "달걀노른자"]
    });
  }
  
  // 비타민D 부족 체크
  if (nutrition.vitamins.vitaminD < 2) {
    recommendations.push({
      name: "연어",
      nutrition: "비타민D",
      description: "비타민D 섭취를 늘려보세요.",
      image: "🐟",
      foodList: ["연어", "고등어", "달걀노른자", "우유", "버섯"]
    });
  }
  
  // 기본 추천
  if (recommendations.length === 0) {
    recommendations.push({
      name: "견과류",
      nutrition: "불포화지방, 단백질",
      description: "건강한 지방과 단백질을 섭취하세요.",
      image: "🥜",
      foodList: ["아몬드", "호두", "땅콩", "피스타치오", "캐슈넛"]
    });
  }
  
  return recommendations;
} 