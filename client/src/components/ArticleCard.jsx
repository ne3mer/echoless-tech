import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, Tag, MessageSquare, ExternalLink } from 'lucide-react';

const ArticleCard = ({ article }) => {
  const { title, summary, source, publishedAt, categories, url, author, imageUrl } = article;
  
  // Format date: "Dec 14, 2025 • 2:30 PM"
  const date = publishedAt ? format(new Date(publishedAt), "MMM d, yyyy • h:mm a") : 'Just now';

  // Creative Layout: If image exists, use it as immersive background with gradient overlay
  const hasImage = !!imageUrl;

  return (
    <article className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface/50 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 ${hasImage ? 'text-white' : 'backdrop-blur-md'}`}>
      
      {/* Immersive Background Image */}
      {hasImage ? (
        <>
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />
        </>
      ) : (
        /* Standard Glow for non-image cards */
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
      )}

      {/* Content Container (Relative to float above background) */}
      <div className="relative flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 ${hasImage ? 'bg-white/10 text-white backdrop-blur-sm' : 'bg-white/5 text-primary'}`}>
                    {source}
                </span>
                <span className={`flex items-center gap-1 ${hasImage ? 'text-gray-300' : ''}`}>
                  <Calendar className="h-3 w-3" /> {date}
                </span>
              </div>
              {categories?.[0] && (
                 <span className={`flex items-center gap-1 ${hasImage ? 'text-primary font-bold' : 'text-accent'}`}>
                   <Tag className="h-3 w-3" /> {categories[0]}
                 </span>
              )}
            </div>

            <h3 className={`mb-3 text-xl font-bold leading-tight transition-colors ${hasImage ? 'text-white group-hover:text-primary' : 'text-white group-hover:text-primary'}`}>
              <Link to={`/articles/${article._id}`} className="focus:outline-none">
                {title}
                <span className="absolute inset-0" aria-hidden="true" />
              </Link>
            </h3>

            <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${hasImage ? 'text-gray-300' : 'text-gray-400'}`}>
              {summary || "Click to read the full story on the original site."}
            </p>
          </div>

          <div className={`mt-4 flex items-center justify-between border-t pt-4 ${hasImage ? 'border-white/10' : 'border-white/5'}`}>
            <div className={`text-xs ${hasImage ? 'text-gray-400' : 'text-gray-500'}`}>
              by <span className={hasImage ? 'text-gray-300' : 'text-gray-300'}>{author}</span>
            </div>
            
            <div className="flex items-center gap-4">
                <Link 
                    to={`/articles/${article._id}`}
                    className="z-10 flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white"
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Discuss
                </Link>
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
      </div>
    </article>
  );
};

export default ArticleCard;
