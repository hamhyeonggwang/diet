'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Utensils, Apple, Zap, Heart, Brain, Eye, Search, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
  foodList: string[];
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [foodName, setFoodName] = useState('');
  const [currentCharacter, setCurrentCharacter] = useState<'chicchic' | 'nyamnyang'>('chicchic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCurrentCharacter('chicchic');
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
    setCurrentCharacter('nyamnyang');
    
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

  // 분석 결과가 나타나면 자동으로 스크롤
  useEffect(() => {
    if (nutritionInfo && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500); // 0.5초 후 스크롤 (애니메이션 완료 후)
    }
  }, [nutritionInfo]);

  // 추천 결과가 나타나면 추가 스크롤
  useEffect(() => {
    if (recommendations.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 1000); // 1초 후 스크롤 (추천 결과 렌더링 완료 후)
    }
  }, [recommendations]);

  const getCharacterMessage = () => {
    if (isAnalyzing) {
      return "냠냥이: 음식을 분석하고 있어요! 잠시만 기다려주세요~ 😸";
    }
    if (nutritionInfo) {
      return "냠냥이: 분석이 완료되었어요! 영양 정보를 확인해보세요! 🍽️";
    }
    return "찍찍이: 음식을 찍어주시면 냠냥이가 분석해드릴게요! 📸";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <Image 
                  src="/images/chicchic.png" 
                  alt="찍찍이" 
                  width={64} 
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs">📷</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              찍찍이와 냠냠이
            </h1>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <Image 
                  src="/images/nyamnyang.png" 
                  alt="냠냥이" 
                  width={64} 
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs">👨‍⚕️</span>
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-700 mb-4">
            찍찍이가 음식을 찍으면 냠냠이가 영양소를 알려줘요!
          </p>
                       <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
               <span className="flex items-center gap-2">
                 <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                 찍찍이 (탐정)
               </span>
               <span>•</span>
               <span className="flex items-center gap-2">
                 <span className="w-3 h-3 bg-pink-400 rounded-full"></span>
                 냠냥이 (영양사)
               </span>
             </div>
        </header>

        {/* 캐릭터 메시지 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                 currentCharacter === 'chicchic' 
                   ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                   : 'bg-gradient-to-r from-pink-400 to-red-500'
               }`}>
                 {currentCharacter === 'chicchic' ? (
                   <Image 
                     src="/images/chicchic.png" 
                     alt="찍찍이" 
                     width={48} 
                     height={48}
                     className="rounded-full object-cover"
                   />
                 ) : (
                   <Image 
                     src="/images/nyamnyang.png" 
                     alt="냠냥이" 
                     width={48} 
                     height={48}
                     className="rounded-full object-cover"
                   />
                 )}
               </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">
                  {getCharacterMessage()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-4xl mx-auto">
          {/* 입력 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                찍찍이의 탐정 시간
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 이미지 업로드 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Search className="h-5 w-5 text-purple-500" />
                  음식 사진 촬영/업로드
                </h3>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-purple-50">
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={selectedImage} 
                        alt="Selected food" 
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        이미지 제거
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600">찍찍이가 음식을 찍어드릴게요!</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleCameraCapture}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all font-medium"
                        >
                          <Camera className="h-4 w-4" />
                          찍기
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg hover:from-purple-500 hover:to-pink-600 transition-all font-medium"
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
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  음식명 직접 입력
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="예: 김치찌개, 샐러드, 닭가슴살..."
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                  />
                  <p className="text-sm text-gray-500">
                                         음식명을 알려주시면 냠냥이가 분석해드릴게요!
                  </p>
                </div>
              </div>
            </div>

            {/* 분석 버튼 */}
            <div className="mt-8 text-center">
              <button
                onClick={analyzeNutrition}
                disabled={isAnalyzing || (!selectedImage && !foodName)}
                className="flex items-center gap-3 mx-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                         냠냥이가 분석 중...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🐱</span>
                                         냠냥이에게 분석 부탁하기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 분석 결과 */}
          {nutritionInfo && (
            <div ref={resultsRef} className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-pink-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                                 <h2 className="text-2xl font-semibold text-gray-800">
                   냠냥이의 영양 분석 결과
                 </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* 기본 영양소 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">기본 영양소</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <span className="flex items-center gap-2 text-gray-900">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        칼로리
                      </span>
                      <span className="font-semibold text-yellow-700">{nutritionInfo.calories} kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                      <span className="flex items-center gap-2 text-gray-900">
                        <Heart className="h-4 w-4 text-red-500" />
                        단백질
                      </span>
                      <span className="font-semibold text-red-700">{nutritionInfo.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <span className="flex items-center gap-2 text-gray-900">
                        <Apple className="h-4 w-4 text-green-500" />
                        탄수화물
                      </span>
                      <span className="font-semibold text-green-700">{nutritionInfo.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <span className="flex items-center gap-2 text-gray-900">
                        <Brain className="h-4 w-4 text-blue-500" />
                        지방
                      </span>
                      <span className="font-semibold text-blue-700">{nutritionInfo.fat}g</span>
                    </div>
                  </div>
                </div>

                {/* 비타민 & 미네랄 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">비타민 & 미네랄</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 font-medium">비타민 A</div>
                      <div className="font-semibold text-orange-700">{nutritionInfo.vitamins.vitaminA} μg</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 font-medium">비타민 C</div>
                      <div className="font-semibold text-orange-700">{nutritionInfo.vitamins.vitaminC} mg</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium">비타민 D</div>
                      <div className="font-semibold text-blue-700">{nutritionInfo.vitamins.vitaminD} μg</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium">비타민 E</div>
                      <div className="font-semibold text-blue-700">{nutritionInfo.vitamins.vitaminE} mg</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 font-medium">칼슘</div>
                      <div className="font-semibold text-green-700">{nutritionInfo.minerals.calcium} mg</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 font-medium">철분</div>
                      <div className="font-semibold text-green-700">{nutritionInfo.minerals.iron} mg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 추천 음식 */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                                 <h2 className="text-2xl font-semibold text-gray-800">
                   냠냥이의 영양소 보충 추천
                 </h2>
              </div>
              
                             <div className="grid md:grid-cols-3 gap-6">
                 {recommendations.map((food, index) => (
                   <div key={index} className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50">
                     <div className="text-4xl mb-3">{food.image}</div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">{food.name}</h3>
                     <p className="text-sm text-purple-600 font-medium mb-2">{food.nutrition}</p>
                     <p className="text-sm text-gray-600 mb-3">{food.description}</p>
                     
                     {/* 추천 음식 리스트 */}
                     <div className="mt-4">
                       <p className="text-xs text-gray-500 mb-2 font-medium">추천 음식:</p>
                       <div className="flex flex-wrap gap-1">
                         {food.foodList.map((foodItem, foodIndex) => (
                           <span 
                             key={foodIndex}
                             className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200"
                           >
                             {foodItem}
                           </span>
                         ))}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
        
        {/* 푸터 - 제작자 정보 */}
        <footer className="mt-16 py-8 border-t border-purple-200">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
                             <div className="flex items-center justify-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                   <span className="text-white text-sm font-bold">R</span>
                 </div>
                 <h3 className="text-lg font-semibold text-gray-800">R.OTi Lab</h3>
               </div>
               <p className="text-gray-600 mb-2">
                 AI를 활용한 친근한 식생활 교육용 웹 애플리케이션
               </p>
               <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                 <span>© 2024 R.OTi Lab</span>
                 <span>•</span>
                 <span>Made with ❤️ for healthy eating</span>
                 <span>•</span>
                 <span>Powered by OpenAI</span>
               </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
