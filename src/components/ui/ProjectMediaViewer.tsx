import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";

interface PropsProjectMediaViewer {
  media: any[];
}



export default function ProjectMediaViewer({ media }: PropsProjectMediaViewer) {
  const [index, setIndex] = useState<number | undefined>(undefined);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minTouchDistance = 50;

  const handlePrevious = () => {
    setIndex((index! - 1 + (media.length )) % (media.length + 1));
  }
  const handleNext = () => {
    setIndex((index! + 1) % ((media.length)));
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(null);
    setTouchStart(event.touches[0].clientX);
  }
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchEnd(event.touches[0].clientX);
  }
  const handleTouchEnd = () => {
    if(touchStart === null || touchEnd === null) return;

    const touchDistance = touchEnd - touchStart;
    if(touchDistance > minTouchDistance) {
      handleNext();
    } else if(touchDistance < -minTouchDistance) {
      handlePrevious();
    }
  }

  useEffect(() => {
    document.addEventListener('openMediaViewer', (event) => {
      setIndex((event as CustomEvent).detail.index);
    });

    return () => {
      document.removeEventListener('openMediaViewer', () => {});
    }
  }, []);

  useEffect(() => {
    if(index === undefined) return;

    const html = document.documentElement;
    const body = document.body;

    const bodyPrev = body.style.overflow;
    const htmlPrev = html.style.overflow;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.overflow = bodyPrev;
      html.style.overflow = htmlPrev;
    };
  }, [index])

  if(index === undefined) return null;

  return (
    <div 
      className="bg-black/90 fixed inset-0 flex justify-center items-center z-100 p-0 sm:p-4 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button 
        className="
          absolute top-4 right-4 
          text-white 
          hover:scale-125 transition duration-300" 
        onClick={() => setIndex(undefined)}>
        <X className="w-12 h-12" />
      </button>

      {/* Flecha Izquierda */}
      <button 
        onClick={handlePrevious} 
        className="absolute top-3/4 left-1/3 sm:top-1/2 sm:left-4 md:left-0 lg:left-4 text-white">
        <ArrowLeft className="w-12 h-12 hover:scale-125 transition duration-300" />
      </button>
      
      {/* Contenedor imagen*/}
      <TransformWrapper>
        <TransformComponent>
          
          <div 
        className="
          w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[80vh] 
          flex items-center justify-center">
        <img src={media[index]} className="max-w-full max-h-full object-contain" />
        </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Flecha Derecha */}
      <button 
        onClick={handleNext} 
        className="absolute top-3/4 right-1/3 sm:top-1/2 sm:right-4 md:right-0 lg:right-4 text-white">
        <ArrowRight className="w-12 h-12 hover:scale-125 transition duration-300" />
      </button>
    </div>
  )
}