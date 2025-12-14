import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import ArticleCard from '../components/ArticleCard';
import { Loader2, RefreshCw } from 'lucide-react';

const fetchArticles = async () => {
  const { data } = await api.get('/articles?limit=30');
  return data.articles;
};

const Home = () => {
  const { data: articles, isLoading, isError, refetch } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-500">Failed to load news feed.</p>
        <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm font-medium hover:bg-white/5"
        >
            <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <header className="mx-auto mb-12 max-w-7xl text-center">
        <h1 className="mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
          Echoless
        </h1>
        <p className="text-lg text-gray-400">
          The signal in the noise. Curated tech news for the modern web.
        </p>
      </header>
      
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </main>
    </div>
  );
};

export default Home;
