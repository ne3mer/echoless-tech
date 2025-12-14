import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import CommentSection from '../components/CommentSection';
import ArticleCard from '../components/ArticleCard';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Tag, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { format } from 'date-fns';

const fetchArticle = async (id) => {
  const { data } = await api.get(`/articles/${id}`);
  return data;
};

// Fetch random related articles (for now just latest 3 excluding current)
const fetchRelatedArticles = async (currentId) => {
    const { data } = await api.get('/articles', { params: { limit: 4 } });
    return data.articles.filter(a => a._id !== currentId).slice(0, 3);
};

const ArticleDetail = () => {
  const { id } = useParams();
  
  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id),
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['related', id],
    queryFn: () => fetchRelatedArticles(id),
    enabled: !!article // Only fetch after main article loads
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-center text-white">
        <p className="text-red-500">Article not found.</p>
        <Link to="/" className="text-primary hover:underline">Back to Feed</Link>
      </div>
    );
  }

  // Calculate Reading Time (rough est: 200 wpm)
  const wordCount = (article.summary + article.title).split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Immersive Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {article.imageUrl ? (
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${article.imageUrl})` }}
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Navigation - Absolute Top */}
        <div className="absolute left-0 right-0 top-0 z-10 p-6">
            <div className="mx-auto max-w-7xl">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/60"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
            </div>
        </div>

        {/* Title & Meta - Bottom of Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="mx-auto max-w-4xl">
                 <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                    <span className="rounded-full bg-primary px-3 py-1 text-white shadow-lg shadow-primary/20">
                        {article.source}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> 
                        {format(new Date(article.publishedAt), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {readTime} min read
                    </span>
                 </div>
                 
                 <h1 className="mb-6 text-4xl font-black leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
                    {article.title}
                 </h1>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-8">
         {/* Main Content Layout */}
         <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            
            {/* Left Column: Article Body & Comments */}
            <div className="min-w-0">
                {/* Author & Actions Bar */}
                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{article.author}</p>
                            <p className="text-xs text-gray-400">Journalist</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-blue-400">
                            <Twitter className="h-4 w-4" />
                        </button>
                        <button className="rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-blue-600">
                            <Facebook className="h-4 w-4" />
                        </button>
                         <button className="rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-blue-500">
                            <Linkedin className="h-4 w-4" />
                        </button>
                         <button className="rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-green-400">
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                 {/* Article Body */}
                 <div className="prose prose-invert prose-lg mb-12 max-w-none">
                    <p className="text-xl leading-relaxed text-gray-300">
                        {article.summary || article.content}
                    </p>
                    {/* Fake extra content for visualization if summary is short */}
                    {!article.content && (
                        <p className="text-gray-400 italic">
                            ... This is a summary view. The full article content can be read on the source website.
                        </p>
                    )}
                 </div>
                 
                 {/* Read Full Story Button */}
                <a 
                    href={article.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group mb-16 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent p-4 text-lg font-bold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
                >
                    Read Full Story on {article.source} <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>

                {/* Tags */}
                <div className="mb-12 border-t border-white/10 pt-8">
                     <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Topics</h3>
                     <div className="flex flex-wrap gap-2">
                        {article.categories?.map(cat => (
                            <span key={cat} className="flex items-center gap-1 rounded-md bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-primary/20 hover:text-primary">
                                <Tag className="h-3 w-3" /> {cat}
                            </span>
                        ))}
                     </div>
                </div>

                {/* Comments */}
                <CommentSection articleId={article._id} />
            </div>

            {/* Right Column: Related News (Desktop Only for Layout) */}
            <div className="hidden lg:block">
               <div className="sticky top-24">
                   <h3 className="mb-6 text-lg font-bold text-white">Related News</h3>
                   <div className="flex flex-col gap-6">
                       {relatedArticles?.map(related => (
                           <Link key={related._id} to={`/articles/${related._id}`} className="group block">
                                <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-gray-800">
                                   {related.imageUrl && (
                                       <div 
                                            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${related.imageUrl})` }}
                                       />
                                   )}
                                </div>
                                <h4 className="mb-2 font-bold text-white transition-colors group-hover:text-primary">
                                    {related.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{related.source}</span>
                                    <span>•</span>
                                    <span>{format(new Date(related.publishedAt), "MMM d")}</span>
                                </div>
                           </Link>
                       ))}
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
