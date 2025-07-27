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
  recipes?: Recipe[];
}

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  nutrition: string;
}

// 1일 권장 영양소 (연령별 기준)
const dailyNutrition = {
  adult: {
    calories: 2000,
    protein: 50,
    carbs: 275,
    fat: 55,
    fiber: 28,
    vitamins: {
      vitaminA: 900,
      vitaminC: 90,
      vitaminD: 15,
      vitaminE: 15
    },
    minerals: {
      calcium: 1000,
      iron: 18,
      potassium: 3500
    }
  },
  teenager: {
    calories: 2200,
    protein: 60,
    carbs: 300,
    fat: 60,
    fiber: 30,
    vitamins: {
      vitaminA: 900,
      vitaminC: 90,
      vitaminD: 15,
      vitaminE: 15
    },
    minerals: {
      calcium: 1300,
      iron: 15,
      potassium: 3500
    }
  },
  child: {
    calories: 1600,
    protein: 40,
    carbs: 200,
    fat: 45,
    fiber: 25,
    vitamins: {
      vitaminA: 600,
      vitaminC: 45,
      vitaminD: 10,
      vitaminE: 11
    },
    minerals: {
      calcium: 1000,
      iron: 10,
      potassium: 3000
    }
  }
};

// 영양소 충족도 계산 함수
const calculateNutritionPercentage = (current: number, recommended: number) => {
  return Math.min((current / recommended) * 100, 100);
};

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [foodName, setFoodName] = useState('');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [currentCharacter, setCurrentCharacter] = useState<'chicchic' | 'nyamnyang'>('chicchic');
  const [selectedAge, setSelectedAge] = useState<'child' | 'teenager' | 'adult'>('child');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 고양이 울음 소리 재생 함수 (아이폰 호환성 개선)
  const playCatMeow = () => {
    try {
      // 아이폰에서는 사용자 상호작용 후에만 AudioContext 생성 가능
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // 아이폰에서 AudioContext가 suspended 상태일 수 있음
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 고양이 울음 소리 주파수 설정 (높은 음에서 낮은 음으로)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.6);
      
      // 볼륨 설정 (아이폰에서는 더 낮은 볼륨 권장)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
      
    } catch (error) {
      console.log('고양이 울음 소리 재생 실패:', error);
      // 아이폰에서 실패해도 앱이 계속 작동하도록 함
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 아이폰에서 파일 크기 제한 확인
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        alert('파일 크기가 너무 큽니다. 10MB 이하의 이미지를 선택해주세요.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCurrentCharacter('chicchic');
      };
      reader.onerror = () => {
        alert('이미지 파일을 읽을 수 없습니다. 다른 이미지를 선택해주세요.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // 아이폰에서 카메라 접근을 위한 사용자 상호작용 확인
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const analyzeNutrition = async () => {
    if (!selectedImage && !foodName) return;
    
    // 고양이 울음 소리 재생
    playCatMeow();
    
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
      setAnalysisMessage(data.message || '');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
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
            <h1 className="text-5xl font-bold text-gray-800">
              찍찍이와 냠냥이
            </h1>
            <div className="relative">
              <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
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
          <p className="text-xl text-gray-600 mb-6">
            찍찍이가 음식을 찍으면 냠냥이가 영양소를 알려줘요!
          </p>
          
          {/* 연령 선택 */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-sm text-gray-600 font-medium">연령 선택:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAge('child')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAge === 'child'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                아동 (6-12세)
              </button>
              <button
                onClick={() => setSelectedAge('teenager')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAge === 'teenager'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                청소년 (13-18세)
              </button>
              <button
                onClick={() => setSelectedAge('adult')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAge === 'adult'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                성인 (19세+)
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                currentCharacter === 'chicchic' 
                  ? 'bg-yellow-400' 
                  : 'bg-pink-400'
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
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
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
                  <Search className="h-5 w-5 text-gray-600" />
                  음식 사진 촬영/업로드
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors bg-gray-50">
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={selectedImage} 
                        alt="Selected food" 
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
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
                      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600">찍찍이가 음식을 찍어드릴게요!</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleCameraCapture}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-all font-medium"
                        >
                          <Camera className="h-4 w-4" />
                          카메라
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
                        >
                          <Upload className="h-4 w-4" />
                          갤러리
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 음식명 입력 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gray-600" />
                  음식명 직접 입력
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="예: 김치찌개, 샐러드, 닭가슴살, 파스타, 샌드위치..."
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-600"
                  />
                  <p className="text-sm text-gray-500 mb-3">
                    어떤 음식이든 입력하시면 냠냥이가 AI로 분석해드릴게요!
                  </p>
                  
                  {/* 빠른 선택 버튼들 */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">아이들 음식 (데이터베이스):</p>
                    <div className="flex flex-wrap gap-2">
                      {['치킨', '떡볶이', '순대', '김밥', '라멘', '파스타', '샌드위치', '토스트', '시리얼', '요거트', '치즈', '아이스크림', '초콜릿', '과자', '딸기', '포도', '오렌지', '키위', '망고', '복숭아', '수박', '멜론', '당근', '브로콜리', '시금치', '감자', '고구마', '콩', '두부', '견과류', '아몬드', '호두', '땅콩', '달걀프라이', '스크램블에그', '오믈렛', '팬케이크', '와플', '도넛', '마카롱', '티라미수', '케이크', '쿠키', '마시멜로', '캔디'].map((food) => (
                        <button
                          key={food}
                          onClick={() => setFoodName(food)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                        >
                          {food}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* AI 분석 예시 */}
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-gray-500 font-medium">AI 분석 예시:</p>
                    <div className="flex flex-wrap gap-2">
                      {['스시', '타코', '커리', '라멘', '떡볶이', '피자', '아이스크림', '샌드위치', '파스타', '라면'].map((food) => (
                        <button
                          key={food}
                          onClick={() => setFoodName(food)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
                        >
                          {food}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 분석 버튼 */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={analyzeNutrition}
                  disabled={isAnalyzing || (!selectedImage && !foodName)}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 touch-manipulation"
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
                
                {/* 냠냥이 그림 */}
                <div className="relative">
                  <div className="w-24 h-24 bg-pink-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
                    <Image 
                      src="/images/nyamnyang.png" 
                      alt="냠냥이" 
                      width={96} 
                      height={96}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-200">
                    <span className="text-sm">👨‍⚕️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 분석 결과 */}
          {nutritionInfo && (
            <div ref={resultsRef} className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    냠냥이의 영양 분석 결과
                  </h2>
                  {analysisMessage && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {analysisMessage}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* 기본 영양소 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">기본 영양소</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center gap-2 text-gray-900">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          칼로리
                        </span>
                        <span className="font-semibold text-yellow-700">{nutritionInfo.calories} kcal</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>1일 권장: {dailyNutrition[selectedAge].calories} kcal</span>
                        <span>{calculateNutritionPercentage(nutritionInfo.calories, dailyNutrition[selectedAge].calories).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateNutritionPercentage(nutritionInfo.calories, dailyNutrition[selectedAge].calories)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center gap-2 text-gray-900">
                          <Heart className="h-4 w-4 text-red-600" />
                          단백질
                        </span>
                        <span className="font-semibold text-red-700">{nutritionInfo.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>1일 권장: {dailyNutrition[selectedAge].protein}g</span>
                        <span>{calculateNutritionPercentage(nutritionInfo.protein, dailyNutrition[selectedAge].protein).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateNutritionPercentage(nutritionInfo.protein, dailyNutrition[selectedAge].protein)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center gap-2 text-gray-900">
                          <Apple className="h-4 w-4 text-green-600" />
                          탄수화물
                        </span>
                        <span className="font-semibold text-green-700">{nutritionInfo.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>1일 권장: {dailyNutrition[selectedAge].carbs}g</span>
                        <span>{calculateNutritionPercentage(nutritionInfo.carbs, dailyNutrition[selectedAge].carbs).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateNutritionPercentage(nutritionInfo.carbs, dailyNutrition[selectedAge].carbs)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center gap-2 text-gray-900">
                          <Brain className="h-4 w-4 text-blue-600" />
                          지방
                        </span>
                        <span className="font-semibold text-blue-700">{nutritionInfo.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>1일 권장: {dailyNutrition[selectedAge].fat}g</span>
                        <span>{calculateNutritionPercentage(nutritionInfo.fat, dailyNutrition[selectedAge].fat).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateNutritionPercentage(nutritionInfo.fat, dailyNutrition[selectedAge].fat)}%` }}
                        ></div>
                      </div>
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
                      <div className="text-xs text-gray-600 mt-1">
                        권장: {dailyNutrition[selectedAge].vitamins.vitaminA} μg
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 font-medium">비타민 C</div>
                      <div className="font-semibold text-orange-700">{nutritionInfo.vitamins.vitaminC} mg</div>
                      <div className="text-xs text-gray-600 mt-1">
                        권장: {dailyNutrition[selectedAge].vitamins.vitaminC} mg
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium">비타민 D</div>
                      <div className="font-semibold text-blue-700">{nutritionInfo.vitamins.vitaminD} μg</div>
                      <div className="text-xs text-gray-600 mt-1">
                        권장: {dailyNutrition[selectedAge].vitamins.vitaminD} μg
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium">비타민 E</div>
                      <div className="font-semibold text-blue-700">{nutritionInfo.vitamins.vitaminE} mg</div>
                      <div className="text-xs text-gray-600 mt-1">
                        권장: {dailyNutrition[selectedAge].vitamins.vitaminE} mg
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 font-medium">칼슘</div>
                      <div className="font-semibold text-green-700">{nutritionInfo.minerals.calcium} mg</div>
                      <div className="text-xs text-gray-600 mt-1">
                        권장: {dailyNutrition[selectedAge].minerals.calcium} mg
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 font-medium">철분</div>
                      <div className="font-semibold text-green-700">{nutritionInfo.minerals.iron} mg</div>
                      <div className="text-xs text-gray-600 mt-1">
                        권장: {dailyNutrition[selectedAge].minerals.iron} mg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 추천 음식 */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  냠냥이의 영양소 보충 추천
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((food, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gray-50">
                    <div className="text-4xl mb-3">{food.image}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{food.name}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-2">{food.nutrition}</p>
                    <p className="text-sm text-gray-600 mb-3">{food.description}</p>
                    
                    {/* 추천 음식 리스트 */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">추천 음식:</p>
                      <div className="flex flex-wrap gap-1">
                        {food.foodList.map((foodItem, foodIndex) => (
                          <span 
                            key={foodIndex}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                          >
                            {foodItem}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* 레시피 섹션 */}
                    {food.recipes && food.recipes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-3 font-medium">레시피 추천:</p>
                        <div className="space-y-3">
                          {food.recipes.map((recipe, recipeIndex) => (
                            <div key={recipeIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-800">{recipe.name}</h4>
                                <div className="flex gap-1">
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {recipe.cookingTime}
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {recipe.difficulty}
                                  </span>
                                </div>
                              </div>
                              
                              {/* 재료 */}
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 font-medium mb-1">재료:</p>
                                <div className="flex flex-wrap gap-1">
                                  {recipe.ingredients.map((ingredient, ingIndex) => (
                                    <span 
                                      key={ingIndex}
                                      className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full"
                                    >
                                      {ingredient}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* 조리법 */}
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 font-medium mb-1">조리법:</p>
                                <ol className="text-xs text-gray-600 space-y-1">
                                  {recipe.instructions.map((instruction, instIndex) => (
                                    <li key={instIndex} className="flex">
                                      <span className="text-blue-500 font-bold mr-2">{instIndex + 1}.</span>
                                      <span>{instruction}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                              
                              {/* 영양소 */}
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">영양소:</p>
                                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                  {recipe.nutrition}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 푸터 - 제작자 정보 */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
