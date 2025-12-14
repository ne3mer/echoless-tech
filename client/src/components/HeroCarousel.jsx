import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const HeroCarousel = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Filter only articles with images, take top 5
  const featuredArticles = articles.filter(a => a.imageUrl).slice(0, 5);

  if (featuredArticles.length === 0) return null;

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
      }, 6000); // 6 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredArticles.length]);

  const currentArticle = featuredArticles[currentIndex];
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative mb-12 h-[500px] w-full overflow-hidden rounded-2xl group">
      {/* Background Images Layer */}
      {featuredArticles.map((article, index) => (
        <div
          key={article._id}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Main Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.imageUrl})` }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </div>
      ))}

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-center px-8 md:px-16">
        <div className="max-w-2xl translate-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 key={currentIndex}">
          <div className="mb-4 flex items-center gap-3">
             <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg shadow-primary/20">
                Trending
             </span>
             <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                {currentArticle.source}
             </span>
             <span className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="h-3 w-3" />
                {format(new Date(currentArticle.publishedAt), "MMM d")}
             </span>
          </div>

          <h2 className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
             {currentArticle.title}
          </h2>

          <p className="mb-8 line-clamp-2 text-lg text-gray-300 md:text-xl">
             {currentArticle.summary}
          </p>

          <div className="flex items-center gap-4">
            <Link 
                to={`/articles/${currentArticle._id}`}
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
                Read Article
            </Link>
            <a 
                href={currentArticle.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
                Source <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-3 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-3 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Example Indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {featuredArticles.map((_, idx) => (
            <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsAutoPlaying(false); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
            />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
