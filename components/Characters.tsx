
import React from 'react';

export const MonsterPink = () => (
  <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center border-4 border-pink-400 float-item shadow-sm">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-black rounded-full"></div>
      <div className="w-2 h-2 bg-black rounded-full"></div>
    </div>
    <div className="absolute top-[-8px] flex gap-4">
      <div className="w-2 h-4 bg-pink-400 rounded-full"></div>
      <div className="w-2 h-4 bg-pink-400 rounded-full"></div>
    </div>
  </div>
);

export const MonsterBlue = () => (
  <div className="w-10 h-10 bg-blue-300 rounded-lg flex items-center justify-center border-4 border-blue-400 float-item shadow-sm" style={{ animationDelay: '0.5s' }}>
    <div className="flex flex-col items-center">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-black rounded-full"></div>
        <div className="w-2 h-2 bg-black rounded-full"></div>
      </div>
      <div className="w-4 h-1 bg-black rounded-full mt-1"></div>
    </div>
  </div>
);

export const MonsterYellow = () => (
  <div className="w-14 h-10 bg-yellow-200 rounded-[40%] flex items-center justify-center border-4 border-yellow-300 float-item shadow-sm" style={{ animationDelay: '1.2s' }}>
    <div className="w-8 h-2 bg-white rounded-full flex justify-around px-1">
      <div className="w-1 h-1 bg-black rounded-full"></div>
      <div className="w-1 h-1 bg-black rounded-full"></div>
    </div>
  </div>
);
