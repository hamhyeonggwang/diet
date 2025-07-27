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

// 영양소 데이터베이스 (실제로는 USDA API 등을 사용)
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
  }
};

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
            foodList: ["김치찌개", "샐러드", "닭가슴살", "밥"]
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

    // 영양소 정보 찾기
    const nutritionInfo = nutritionDatabase[identifiedFood as keyof typeof nutritionDatabase];
    
    if (!nutritionInfo) {
      // 기본 영양소 정보 제공
      const defaultNutrition: NutritionInfo = {
        calories: 200,
        protein: 10,
        carbs: 30,
        fat: 5,
        fiber: 3,
        vitamins: { vitaminA: 100, vitaminC: 10, vitaminD: 1, vitaminE: 1 },
        minerals: { calcium: 50, iron: 1, potassium: 200 }
      };

      return NextResponse.json({
        food: identifiedFood,
        nutrition: defaultNutrition,
        recommendations: generateRecommendations(defaultNutrition)
      });
    }

    const recommendations = generateRecommendations(nutritionInfo);

    return NextResponse.json({
      food: identifiedFood,
      nutrition: nutritionInfo,
      recommendations
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