
import { Pin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TocEntry = { id: string; label: string };

export default function TableOfContents() {
  const [sections, setSections] = useState<TocEntry[]>([]);
  const observer = useRef<IntersectionObserver | null>(null); 

  const prevRatio = useRef<number>(0.0);

  const createrInsertionObserver = (entries: TocEntry[]) => {
    let elements = new Array<HTMLElement>();

    entries.forEach(({ id }) => {
      const element = document.getElementById(id);
      if(element){
        elements.push(element);
      }else{
        console.warn(`No se encontró el elemento para: ${id}`);
      }
    });

    let options = {
      root: null as HTMLElement | null,
      rootMargin: "0px",
      threshold: 1.0,
    };
    
    observer.current = new IntersectionObserver(handleIntersect, options);
    elements.forEach((element: HTMLElement) => {
      observer.current?.observe(element);
    })
  }

  const handleIntersect = (entries: any) => {

    entries.forEach(function (entry: IntersectionObserverEntry) {
      let sectionId = (entry.target as HTMLElement).dataset.key;
      let menuElement = document.querySelector(`li[data-key="${sectionId}"]`);

      if(menuElement){
        if (entry.intersectionRatio > prevRatio.current!) {
          (menuElement as HTMLElement).classList.add('border-purple-800');
          (menuElement as HTMLElement).classList.remove('border-gray-800');
        }else{
          (menuElement as HTMLElement).classList.remove('border-purple-800');
          (menuElement as HTMLElement).classList.add('border-gray-800');
        }
      }else{
        console.warn(`No se encontró el enlace para: ${sectionId}`);
      }

      prevRatio.current = entry.intersectionRatio;
    })
  }

  const getIndex = (): TocEntry[] => {
    let entries: TocEntry[] = [];

    document.querySelectorAll(".scroll-anchor").forEach((element) => {
      entries.push({ id: element.id, label: element.textContent || "" });
    });

    return entries;
  }

  useEffect(() => {
    const entries = getIndex();
    setSections(entries);
    createrInsertionObserver(entries);

    return () => observer.current?.disconnect();
  }, []);

  return (
    <nav 
      className="
        w-full
        sticky top-35 
        text-start
        bg-(--bg-card) dark:bg-(--bg-card-dark)
        border border-zinc-300 dark:border-zinc-900
        rounded-xl
        p-6
        text-black dark:text-white ">
      <span className="flex flex-col items-start justify-start gap-2">
        
        <span 
          data-key="project-features"
          className="
            flex items-center justify-center gap-2
            text-[13px] sm:text-base lg:text-[12px] xl:text-sm
            text-black dark:text-white font-bold">
            <Pin className="w-4 h-4 text-gray-300 dark:text-white" />
            En esta página
        </span>
        <ul className="list-none">
          {
            sections.map(({ id, label }) => (
              <li 
                data-key={id} 
                key={id}
                className="border-l-3 border-gray-800 pl-2 transition-all duration-300">
                <a href={`#${id}`} className=" hover:text-white transition-all duration-300">{label}</a>
              </li>
            ))
          }
        </ul>
      </span>
    </nav>
  )
}