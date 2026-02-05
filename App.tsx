
import React, { useState, useRef, useEffect } from 'react';
import { AppStatus, RecognitionResult } from './types';
import { analyzeImage, playTTS } from './services/geminiService';
import { MonsterPink, MonsterBlue } from './components/Characters';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('세상을 구경하는 중...');
  const [captureCount, setCaptureCount] = useState<number>(() => {
    const saved = localStorage.getItem('vocalens_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    localStorage.setItem('vocalens_count', captureCount.toString());
  }, [captureCount]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 } },
        audio: false 
      });
      setStream(mediaStream);
      setStatus(AppStatus.CAPTURING);
    } catch (err) {
      console.error("Camera failed", err);
      // 에러 화면 대신 알림 후 IDLE 유지
      alert("카메라를 켤 수 없어요. 권한을 확인해주세요!");
      setStatus(AppStatus.IDLE);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          setStream(null);
        }
        processImage(dataUrl);
      }
    }
  };

  const processImage = async (dataUrl: string) => {
    setStatus(AppStatus.PROCESSING);
    setLoadingMessage("무엇일까? 생각 중... 🤔");
    try {
      const base64 = dataUrl.split(',')[1];
      const data = await analyzeImage(base64);
      setResult(data);
      setStatus(AppStatus.RESULT);
      setCaptureCount(prev => prev + 1);
    } catch (err) {
      console.error("AI Error:", err);
      setLoadingMessage("앗! 다시 시도할게요... 🔄");
      // 2초 후 자동 재촬영 모드로 복귀
      setTimeout(() => {
        resetToCamera();
      }, 2000);
    }
  };

  const resetToCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setResult(null);
    setCapturedImage(null);
    startCamera();
  };

  const resetAll = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setResult(null);
    setCapturedImage(null);
    setStatus(AppStatus.IDLE);
    window.speechSynthesis.cancel();
  };

  const handleSpeak = (text: string, lang: string, id: string) => {
    setSpeakingId(id);
    playTTS(text, lang, () => setSpeakingId(null));
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-md mx-auto bg-[#FDFCF0] font-Fredoka">
      <header className="text-center py-4">
        <h1 className="text-3xl font-black text-pink-500">
          보카렌즈 <span className="text-blue-500">Vocalens</span>
        </h1>
        <div className="mt-2 inline-block bg-white px-4 py-1 rounded-full border border-pink-100 shadow-sm">
          <p className="text-pink-400 text-xs font-bold">수집한 단어: {captureCount}개</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
            <MonsterBlue />
            <button 
              onClick={startCamera} 
              className="w-48 h-48 bg-white toy-frame flex flex-col items-center justify-center gap-4 text-pink-500 active:scale-90 transition-transform group"
            >
              <i className="fas fa-camera text-6xl group-hover:scale-110 transition-transform"></i>
              <span className="font-bold text-lg">카메라 켜기</span>
            </button>
            <p className="text-gray-400 text-sm font-medium">사물을 찍으면 9개 국어로 알려줘요!</p>
          </div>
        )}

        {(status === AppStatus.CAPTURING || status === AppStatus.PROCESSING) && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="toy-frame overflow-hidden bg-black aspect-[3/4] w-full relative shadow-2xl">
              {status === AppStatus.CAPTURING ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-pink-500 text-white p-6">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
                  <p className="text-xl font-bold text-center">{loadingMessage}</p>
                </div>
              )}
            </div>
            {status === AppStatus.CAPTURING && (
              <button 
                onClick={capturePhoto} 
                className="mt-8 w-20 h-20 bg-pink-500 rounded-full border-8 border-white shadow-xl flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <i className="fas fa-camera text-2xl"></i>
              </button>
            )}
          </div>
        )}

        {status === AppStatus.RESULT && result && (
          <div className="w-full flex flex-col gap-4 pb-20 animate-in slide-in-from-bottom-8 duration-500">
            <div className="toy-frame h-32 w-full relative mb-2 overflow-hidden shadow-md">
              <img src={capturedImage!} className="w-full h-full object-cover" alt="Captured" />
              <button onClick={resetToCamera} className="absolute top-2 right-2 bg-white/90 text-pink-500 w-8 h-8 rounded-full shadow-lg"><i className="fas fa-redo text-sm"></i></button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { name: '한국어', data: result.korean, code: 'ko', color: 'blue' },
                { name: 'English', data: result.english, code: 'en', color: 'pink' },
                { name: '日本語', data: result.japanese, code: 'ja', color: 'purple' },
                { name: '中文', data: result.chinese, code: 'zh', color: 'yellow' },
                { name: 'Español', data: result.spanish, code: 'es', color: 'orange' },
                { name: 'Français', data: result.french, code: 'fr', color: 'teal' },
                { name: 'Deutsch', data: result.german, code: 'de', color: 'green' },
                { name: 'Русский', data: result.russian, code: 'ru', color: 'red' },
                { name: 'हिन्दी', data: result.hindi, code: 'hi', color: 'amber' }
              ].map((item) => (
                <button 
                  key={item.code}
                  onClick={() => handleSpeak(item.data.word, item.code, item.code)}
                  className={`w-full pastel-card p-4 border-4 transition-all flex items-center justify-between ${
                    speakingId === item.code ? 'bg-yellow-200 border-yellow-400 scale-[1.02] shadow-lg' : `border-${item.color}-100 bg-white`
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">{item.name}</span>
                    <h2 className={`text-2xl font-black text-${item.color}-500`}>{item.data.word}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400 font-medium">{item.data.pronunciation}</span>
                    <i className={`fas fa-volume-up text-${item.color}-300 ${speakingId === item.code ? 'animate-bounce text-yellow-600' : ''}`}></i>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={resetToCamera} className="w-full bg-pink-500 text-white py-5 rounded-3xl font-black text-lg shadow-lg mt-4 active:scale-95 transition-transform">
              다른 것도 찍어보기 📸
            </button>
            <button onClick={resetAll} className="w-full text-gray-400 font-bold py-2 text-sm">처음으로 돌아가기</button>
          </div>
        )}
      </main>

      <canvas ref={canvasRef} className="hidden" />
      <footer className="py-4 text-center opacity-20 text-[10px] font-bold tracking-widest">
        POWERED BY GEMINI 3 FLASH
      </footer>
    </div>
  );
};

export default App;
