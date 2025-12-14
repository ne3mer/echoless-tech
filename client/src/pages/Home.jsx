import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ArticleCard from '../components/ArticleCard';
import { Loader2, RefreshCw, LogIn, UserPlus, LogOut, User, Search } from 'lucide-react'; // Added Search
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All', 'AI', 'Cybersecurity', 'Consumer Electronics', 'Software & Apps', 
  'Cloud & Big Data', 'Gaming', 'Space Tech', 'Green Tech', 'Emerging Tech', 'Coding'
];

import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; // We need to create this or use useEffect

// Simplified approach: Use useEffect for debounce inside component or just local state with timer if easier.
// Let's stick to standard effective ways.

const fetchArticles = async (category, search) => {
  const params = { limit: 30 };
  if (category && category !== 'All') {
    params.category = category;
  }
  if (search) {
    params.search = search;
  }
  const { data } = await api.get('/articles', { params });
  return data.articles;
};

const Home = () => {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  // Simple debounce logic
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const { data: articles, isLoading, isError, refetch } = useQuery({
    queryKey: ['articles', selectedCategory, debouncedSearch],
    queryFn: () => fetchArticles(selectedCategory, debouncedSearch),
    refetchInterval: 5 * 60 * 1000, 
    refetchOnWindowFocus: true,
    keepPreviousData: true // Nice UX
  });

  if (isLoading && !articles) { // Show loading only on first load
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
                
                 {/* Desktop Search */}
                 <div className="hidden flex-1 px-8 md:block">
                    <div className="relative mx-auto max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text"
                            placeholder="Search news..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-gray-300 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
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
            
             {/* Mobile Search */}
             <div className="mt-3 block px-2 md:hidden">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text"
                        placeholder="Search news..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-gray-300 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
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
                    onClick={() => {
                        setSelectedCategory(cat);
                        setSearchTerm(''); // Clear search when changing category for clarity
                    }}
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
          {articles?.length > 0 ? (
            articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
            ))
          ) : (
             <div className="col-span-full py-20 text-center text-gray-500">
                <p>No articles found for "{debouncedSearch || selectedCategory}".</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
