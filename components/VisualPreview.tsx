
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';
import { LrcLine, ScriptConfig } from '../types';

interface VisualPreviewProps {
  lines: LrcLine[];
  config: ScriptConfig;
}

const VisualPreview: React.FC<VisualPreviewProps> = ({ lines, config }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);

  // Reset when lines change
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [lines]);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setCurrentTime(prev => {
         const next = prev + deltaTime;
         if (lines.length > 0 && next > lines[lines.length - 1].timestamp + 10) {
            return 0;
         }
         return next;
      });
    }
    previousTimeRef.current = time;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      previousTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const seek = (offset: number) => setCurrentTime(t => Math.max(0, t + offset));

  let activeIndex = 0;
  for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].timestamp) {
          activeIndex = i;
      }
  }

  // Viscous scroll transition
  const bounceTransition = "transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)";

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-neutral-700 shadow-xl overflow-hidden relative">
       {/* Preview Canvas */}
       <div className="flex-1 relative overflow-hidden bg-black" style={{
           fontFamily: config.fontFamily.split('-')[0] || 'sans-serif',
       }}>
           <div className={`absolute inset-0 flex flex-col justify-center ${config.alignment === 'left' ? 'items-start pl-12' : 'items-center'}`}
                style={{
                    transform: `translateY(${-activeIndex * config.spacing}px)`,
                    transition: bounceTransition,
                    willChange: 'transform'
                }}
           >
               {lines.map((line, idx) => {
                   const isActive = idx === activeIndex;
                   
                   // Logic:
                   // Active Line: 0 blur, Scale Up.
                   // Others: Blur, Scale 1, Low Opacity.
                   const blur = isActive ? 0 : config.blurAmount;
                   const scale = isActive ? config.activeScale : 1;
                   
                   // Calculate fill progress for the active line
                   let fillPercentage = 0;
                   if (isActive) {
                       const startTime = line.timestamp;
                       const endTime = (idx < lines.length - 1) ? lines[idx+1].timestamp : (startTime + 5);
                       const duration = endTime - startTime;
                       const elapsed = currentTime - startTime;
                       fillPercentage = Math.min(100, Math.max(0, (elapsed / duration) * 100));
                   } else if (currentTime > line.timestamp) {
                       fillPercentage = 100; // Past lines are full white
                   }

                   // Clip Paths using inset
                   // Gray Layer (Base): Show RIGHT side (Unfilled) -> Hide Left side (Filled)
                   // clip-path: inset(top right bottom left)
                   const grayClip = `inset(0 0 0 ${fillPercentage}%)`;

                   // White Layer (Active): Show LEFT side (Filled) -> Hide Right side (Unfilled)
                   const whiteClip = `inset(0 ${100 - fillPercentage}% 0 0)`;

                   return (
                       <div 
                        key={line.id}
                        className={`absolute w-full flex ${config.alignment === 'center' ? 'justify-center' : 'justify-start'}`}
                        style={{
                            top: '50%',
                            marginTop: -45, // Centering adjustment
                            transform: `translateY(${idx * config.spacing}px) scale(${scale})`,
                            transition: `transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.5s ease, opacity 0.5s ease`, 
                            transformOrigin: config.alignment === 'left' ? '0% 50%' : '50% 50%',
                            opacity: isActive ? 1 : (config.inactiveOpacity / 100),
                            filter: `blur(${blur}px)`,
                            fontSize: `${config.fontSize}px`,
                            fontWeight: isActive ? 700 : 500,
                            whiteSpace: 'nowrap',
                            zIndex: isActive ? 10 : 1
                        }}
                       >
                           {/* Container for the dual-layer text */}
                           <div className="relative inline-block">
                                {/* 1. Base Layer (Gray, Down) */}
                                <span style={{ 
                                    color: config.inactiveTextColor,
                                    display: 'block',
                                    clipPath: grayClip,
                                    willChange: 'clip-path'
                                }}>
                                    {line.text}
                                </span>
                                
                                {/* 2. Active Layer (White, Lifted) */}
                                <span 
                                    style={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        color: config.textColor, 
                                        display: 'block',
                                        clipPath: whiteClip,
                                        willChange: 'clip-path',
                                        // Apply lift only to the white part. 
                                        // This creates the "wave" effect where the white text pops up as it fills.
                                        transform: `translateY(-${config.textLift}px)` 
                                    }}
                                >
                                    {line.text}
                                </span>
                           </div>
                       </div>
                   )
               })}
           </div>
           
           {/* Timecode overlay */}
           <div className="absolute top-4 right-4 text-xs font-mono text-neutral-500 z-50">
               {currentTime.toFixed(2)}s
           </div>
       </div>

       {/* Controls */}
       <div className="h-14 bg-neutral-900 border-t border-neutral-700 flex items-center justify-center space-x-6 px-4 z-50">
            <button onClick={() => seek(-5)} className="text-neutral-400 hover:text-white transition"><Rewind size={20}/></button>
            <button 
                onClick={togglePlay} 
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition"
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5"/>}
            </button>
            <button onClick={() => seek(5)} className="text-neutral-400 hover:text-white transition"><FastForward size={20}/></button>
       </div>
    </div>
  );
};

export default VisualPreview;
