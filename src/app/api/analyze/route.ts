import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 영양소 데이터베이스 (실제로는 USDA API 등을 사용)
const nutritionDatabase = {
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
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
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
    } else if (foodName) {
      identifiedFood = foodName;
    }

    // 영양소 정보 찾기
    const nutritionInfo = nutritionDatabase[identifiedFood as keyof typeof nutritionDatabase];
    
    if (!nutritionInfo) {
      // 기본 영양소 정보 제공
      const defaultNutrition = {
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

function generateRecommendations(nutrition: any) {
  const recommendations = [];
  
  // 철분 부족 체크
  if (nutrition.minerals.iron < 5) {
    recommendations.push({
      name: "시금치",
      nutrition: "철분, 비타민A",
      description: "철분이 부족합니다. 시금치를 추가로 섭취하세요.",
      image: "🥬"
    });
  }
  
  // 비타민C 부족 체크
  if (nutrition.vitamins.vitaminC < 30) {
    recommendations.push({
      name: "오렌지",
      nutrition: "비타민C",
      description: "비타민C 섭취를 늘려보세요.",
      image: "🍊"
    });
  }
  
  // 단백질 부족 체크
  if (nutrition.protein < 15) {
    recommendations.push({
      name: "연어",
      nutrition: "오메가3, 단백질",
      description: "고품질 단백질과 오메가3를 섭취하세요.",
      image: "🐟"
    });
  }
  
  // 칼슘 부족 체크
  if (nutrition.minerals.calcium < 100) {
    recommendations.push({
      name: "우유",
      nutrition: "칼슘, 단백질",
      description: "칼슘 섭취를 늘려보세요.",
      image: "🥛"
    });
  }
  
  // 기본 추천
  if (recommendations.length === 0) {
    recommendations.push({
      name: "견과류",
      nutrition: "불포화지방, 단백질",
      description: "건강한 지방과 단백질을 섭취하세요.",
      image: "🥜"
    });
  }
  
  return recommendations;
} 