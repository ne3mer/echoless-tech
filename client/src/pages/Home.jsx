import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ArticleCard from '../components/ArticleCard';
import { Loader2, RefreshCw, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All', 'AI', 'Cybersecurity', 'Consumer Electronics', 'Software & Apps', 
  'Cloud & Big Data', 'Gaming', 'Space Tech', 'Green Tech', 'Emerging Tech', 'Coding'
];

const fetchArticles = async (category) => {
  const params = { limit: 30 };
  if (category && category !== 'All') {
    params.category = category;
  }
  const { data } = await api.get('/articles', { params });
  return data.articles;
};

const Home = () => {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const { data: articles, isLoading, isError, refetch } = useQuery({
    queryKey: ['articles', selectedCategory],
    queryFn: () => fetchArticles(selectedCategory),
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
    <div className="min-h-screen bg-background text-base">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
                        Echoless
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
                                <User className="h-4 w-4" />
                                {user.username}
                            </Link>
                            <button 
                                onClick={logout}
                                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <LogOut className="h-3.5 w-3.5" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/login"
                                className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                            >
                                <LogIn className="h-4 w-4" /> Login
                            </Link>
                            <Link 
                                to="/register"
                                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                            >
                                <UserPlus className="h-4 w-4" /> Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>

      <div className="px-4 py-8 md:px-8">
        <header className="mx-auto mb-8 max-w-7xl text-center">
          <h1 className="mb-2 text-4xl font-extrabold text-white sm:text-6xl">
            Tech News <span className="text-gray-600">Reimagined</span>
          </h1>
          <p className="text-lg text-gray-400">
            Real-time feed from the best sources in tech.
          </p>
        </header>

        {/* Category Filters */}
        <div className="mx-auto mb-10 flex max-w-7xl gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                        selectedCategory === cat 
                        ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
        
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.length > 0 ? (
            articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
            ))
          ) : (
             <div className="col-span-full py-20 text-center text-gray-500">
                <p>No articles found for "{selectedCategory}".</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
