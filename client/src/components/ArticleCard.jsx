import React from 'react';
import { ExternalLink, MessageSquare, Calendar, Tag } from 'lucide-react';

const ArticleCard = ({ article }) => {
  const { title, summary, source, publishedAt, categories, url, author } = article;
  
  // Format date loosely
  const date = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface/50 p-6 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-surface/80 hover:shadow-lg hover:shadow-primary/5">
      
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />

      <div>
        <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/5 px-2 py-1 text-primary">{source}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {date}
            </span>
          </div>
          {categories?.[0] && (
             <span className="flex items-center gap-1 text-accent">
               <Tag className="h-3 w-3" /> {categories[0]}
             </span>
          )}
        </div>

        <h3 className="mb-3 text-xl font-bold leading-tight text-white transition-colors group-hover:text-primary">
          <a href={url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
            {title}
            <span className="absolute inset-0" aria-hidden="true" />
          </a>
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-400">
          {summary || "Click to read the full story on the original site."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="text-xs text-gray-500">
          by <span className="text-gray-300">{author}</span>
        </div>
        
        <div className="flex items-center gap-4">
            <button className="z-10 flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white">
                <MessageSquare className="h-3.5 w-3.5" />
                Discuss
            </button>
            <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="z-10 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
                Read Source <ExternalLink className="h-3 w-3" />
            </a>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
