import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import CommentSection from '../components/CommentSection';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Tag, User } from 'lucide-react';
import { format } from 'date-fns';

const fetchArticle = async (id) => {
  const { data } = await api.get(`/articles/${id}`);
  return data;
};

const ArticleDetail = () => {
  const { id } = useParams();
  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id),
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
        <Link to="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link 
          to="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>
        
        <article>
          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
               <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-primary">
                 {article.source}
               </span>
               <span className="flex items-center gap-1.5">
                 <Calendar className="h-4 w-4" /> 
                 {format(new Date(article.publishedAt), "MMMM d, yyyy")}
               </span>
               <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author}
               </span>
            </div>

            <h1 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-5xl">
              {article.title}
            </h1>
            
            {/* Categories */}
            <div className="mb-8 flex flex-wrap gap-2">
                {article.categories?.map(cat => (
                    <span key={cat} className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">
                        <Tag className="h-3 w-3" /> {cat}
                    </span>
                ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/20 p-8 backdrop-blur-sm">
             <p className="mb-6 text-lg leading-relaxed text-gray-300">
               {article.summary || article.content}
             </p>
             
             <div className="mt-8 flex justify-end">
                <a 
                    href={article.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                >
                    Read Full Story <ExternalLink className="h-4 w-4" />
                </a>
             </div>
          </div>
        </article>

        {/* Comments Section */}
        <CommentSection articleId={article._id} />
      </div>
    </div>
  );
};

export default ArticleDetail;
