import type { ZodStringFormat } from "astro:schema";
import { Pin } from "lucide-react";
import { useEffect } from "react";

export default function TableOfContents() {

  const getIndex = (): Map<String, String> => {
    let i: Map<String, String> = new Map;

    document.querySelectorAll(".title-content").forEach((element) => {
      i.set(element.id, element.textContent)
    });

    return i ?? [];
  }

  useEffect(() => {
    getIndex();
  }, []);

  return (
    <nav className="w-full lg:w-1/4 sticky text-start top-35 text-black dark:text-white h-full">
      <span className="flex flex-col items-center justify-center gap-2">
        
        <span 
          className="
            flex items-center justify-center gap-2
            text-[13px] sm:text-base lg:text-[12px] xl:text-sm
            text-black dark:text-white font-bold">
            <Pin className="w-4 h-4 text-gray-300 dark:text-white" />
            En esta página
        </span>
        <ul className="list-disc list-inside">
          {
            Array.from(getIndex()).map(([key, value]) => (
                <li>
                  <a href={`#${key.toLowerCase().replace(/ /g, '-')}`}>{value}</a>
                </li>
            ))
          }
        </ul>
      </span>
    </nav>
  )
}