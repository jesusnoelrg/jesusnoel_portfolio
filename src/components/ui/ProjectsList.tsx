
import { useState } from 'react';

import Projects from "../../data/projects.json";
import Technologies from '../../data/technologies.json';
import { resolveAsset } from "../../utils/resolveAsset";
import { ArrowRight } from 'lucide-react';

interface Project {
  slug: string;
  title: string;
  category: string[];
  image?: string;
  description: string;
  techStack: string[];
}

const projects: Project[] = Projects.map((project) => {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    image: resolveAsset(project.assets.present),
    description: project.content.description,
    techStack: project.tech_stack,
  };
});

export default function ProjectsControls () {
  const [category, setCategory] = useState('Todos');

  const getCategories = ['Todos', 'IA', 'Frontend', 'Backend', 'Integraciones'];

  const filterProjectsByCategory = (c: string) => {
    if (category === 'Todos') return projects;
    return projects.filter(p => p.category.includes(category));
  };


  return (
    <>
    <div className="mb-20">
      <div className="flex flex-row gap-4 justify-center">
        {
          getCategories.map(name => {
            const isSelected = category === name;

            return (
            <button 
              className={`
                px-4 py-2 rounded-md
                border transition-all duration-300
                text-black dark:text-white
                bg-zinc-100/60 dark:bg-zinc-900/60 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/90
                ${isSelected
                  ? 'border-purple-900 '
                  : 'border-zinc-200 dark:border-zinc-800 '}
              `}
              onClick={() => setCategory(name)}
              key={name}
            >
              {name}
            </button>
            );
          })
        }
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {filterProjectsByCategory(category).map((proyecto: Project) => (
        <div 
          key={proyecto.slug}
          className="
            relative group
            p-6 
            border border-zinc-300 dark:border-zinc-900 rounded-2xl
          bg-(--bg-card) dark:bg-(--bg-card-dark)
            hover:scale-105 transition-transform duration-300">
          <a href={`/projects/${proyecto.slug}`} className="after:absolute after:inset-0"></a>
          <div className='relative'>
            <div className='absolute flex items-center gap-2 top-2 left-2'>
              {proyecto.category.map(c => (
                <div key={c} className='bg-zinc-800 border-zinc-600 border py-1 px-4 rounded-xl text-xs text-white'>
                  {c}
                </div>
              ))}
            </div>
            
            <img src={proyecto.image} alt={proyecto.title} className="w-full h-70 object-cover rounded-lg mb-4" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold mb-2 text-black dark:text-white">
            {proyecto.title}
          </h1>
          <p className="text-sm lg:text-[16px] text-gray-800 dark:text-gray-300">
            {proyecto.description.slice(0, 100)}...
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {proyecto.techStack.map(technology => (
              <div key={technology} className="
                flex items-center justify-center 
                px-3 py-1
                border border-zinc-300 dark:border-zinc-900 rounded-2xl
                text-sm 
                text-black dark:text-white bg-zinc-50 dark:bg-zinc-900 " >
                <img src={resolveAsset(Technologies.find(t => t.name === technology)?.url_img)} alt={technology} className="w-4 h-4 me-1" />
                {technology}
              </div>
            ))}
          </div>
          <span
            className="
              flex items-center justify-start
              px-3 py-1 mt-4 rounded-2xl
              text-purple-800 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 group-hover:underline
              transition-colors duration-300">
              Ver proyecto
              <ArrowRight className="w-4 h-4" />
            </span>
        </div>
      ))}
    </div>
  </>
  )
}