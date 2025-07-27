'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Utensils, Apple, Zap, Heart, Brain, Eye } from 'lucide-react';

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

interface RecommendedFood {
  name: string;
  nutrition: string;
  description: string;
  image: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [foodName, setFoodName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const analyzeNutrition = async () => {
    if (!selectedImage && !foodName) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          foodName: foodName
        }),
      });

      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다.');
      }

      const data = await response.json();
      
      setNutritionInfo(data.nutrition);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('영양 분석 오류:', error);
      alert('영양 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">N</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              🥗 영양 분석기
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            음식을 촬영하거나 입력하면 칼로리와 영양소를 분석해드립니다
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>AI 기반 영양 분석</span>
            <span>•</span>
            <span>개인화된 추천</span>
            <span>•</span>
            <span>건강한 식생활</span>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="max-w-4xl mx-auto">
          {/* 입력 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              음식 정보 입력
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 이미지 업로드 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">사진 촬영/업로드</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={selectedImage} 
                        alt="Selected food" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        이미지 제거
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">음식 사진을 촬영하거나 업로드하세요</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleCameraCapture}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Camera className="h-4 w-4" />
                          촬영
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          업로드
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 음식명 입력 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">음식명 직접 입력</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="예: 김치찌개, 샐러드, 닭가슴살..."
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500">
                    음식명을 입력하면 AI가 영양 정보를 분석해드립니다
                  </p>
                </div>
              </div>
            </div>

            {/* 분석 버튼 */}
            <div className="mt-8 text-center">
              <button
                onClick={analyzeNutrition}
                disabled={isAnalyzing || (!selectedImage && !foodName)}
                className="flex items-center gap-2 mx-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    분석 중...
                  </>
                ) : (
                  <>
                    <Utensils className="h-5 w-5" />
                    영양 분석하기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 분석 결과 */}
          {nutritionInfo && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                📊 영양 분석 결과
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* 기본 영양소 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-700">기본 영양소</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        칼로리
                      </span>
                      <span className="font-semibold">{nutritionInfo.calories} kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        단백질
                      </span>
                      <span className="font-semibold">{nutritionInfo.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Apple className="h-4 w-4 text-green-500" />
                        탄수화물
                      </span>
                      <span className="font-semibold">{nutritionInfo.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        지방
                      </span>
                      <span className="font-semibold">{nutritionInfo.fat}g</span>
                    </div>
                  </div>
                </div>

                {/* 비타민 & 미네랄 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-700">비타민 & 미네랄</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-600">비타민 A</div>
                      <div className="font-semibold">{nutritionInfo.vitamins.vitaminA} μg</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-600">비타민 C</div>
                      <div className="font-semibold">{nutritionInfo.vitamins.vitaminC} mg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600">비타민 D</div>
                      <div className="font-semibold">{nutritionInfo.vitamins.vitaminD} μg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600">비타민 E</div>
                      <div className="font-semibold">{nutritionInfo.vitamins.vitaminE} mg</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600">칼슘</div>
                      <div className="font-semibold">{nutritionInfo.minerals.calcium} mg</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600">철분</div>
                      <div className="font-semibold">{nutritionInfo.minerals.iron} mg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 추천 음식 */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                💡 영양소 보충 추천
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((food, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">{food.image}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{food.name}</h3>
                    <p className="text-sm text-green-600 font-medium mb-2">{food.nutrition}</p>
                    <p className="text-sm text-gray-600">{food.description}</p>
                  </div>
                ))}
              </div>
            </div>
                     )}
         </div>
       </div>
       
       {/* 푸터 - 제작자 정보 */}
       <footer className="mt-16 py-8 border-t border-gray-200">
         <div className="max-w-4xl mx-auto px-4">
           <div className="text-center">
             <div className="flex items-center justify-center gap-2 mb-4">
               <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                 <span className="text-white text-sm font-bold">N</span>
               </div>
               <h3 className="text-lg font-semibold text-gray-800">영양 분석기</h3>
             </div>
             <p className="text-gray-600 mb-2">
               AI를 활용한 식생활 교육용 웹 애플리케이션
             </p>
             <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
               <span>© 2024 Nutrition Analyzer</span>
               <span>•</span>
               <span>Made with ❤️ for healthy eating</span>
               <span>•</span>
               <span>Powered by OpenAI</span>
             </div>
           </div>
         </div>
       </footer>
     </div>
   );
 }
