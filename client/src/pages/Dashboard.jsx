import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Loader2, User, MessageCircle, Star, ThumbsUp, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data } = await api.get('/users/profile');
      return data;
    },
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['userActivity'],
    queryFn: async () => {
      const { data } = await api.get('/users/activity');
      return data;
    },
  });

  if (profileLoading || activityLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {profile.username}!</p>
            </div>
            <button 
                onClick={logout}
                className="self-start rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white md:self-auto"
            >
                Sign Out
            </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
             <div className="rounded-2xl border border-white/10 bg-surface/30 p-6 backdrop-blur-md">
                <div className="mb-2 flex items-center gap-3 text-gray-400">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Star className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Karma</span>
                </div>
                <div className="text-3xl font-bold text-white">{profile.stats?.karma || 0}</div>
             </div>

             <div className="rounded-2xl border border-white/10 bg-surface/30 p-6 backdrop-blur-md">
                <div className="mb-2 flex items-center gap-3 text-gray-400">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                        <MessageCircle className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Total Comments</span>
                </div>
                <div className="text-3xl font-bold text-white">{profile.stats?.totalComments || 0}</div>
             </div>

             <div className="rounded-2xl border border-white/10 bg-surface/30 p-6 backdrop-blur-md">
                <div className="mb-2 flex items-center gap-3 text-gray-400">
                    <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
                        <ThumbsUp className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Upvotes Given</span>
                </div>
                <div className="text-3xl font-bold text-white">{profile.stats?.upvotesGiven || 0}</div>
             </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border border-white/10 bg-surface/20 p-6 backdrop-blur-sm">
            <h2 className="mb-6 text-xl font-bold text-white">Recent Activity</h2>
            
            {activity && activity.length > 0 ? (
                <div className="space-y-4">
                    {activity.map((item) => (
                        <div key={item._id} className="group relative rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {format(new Date(item.createdAt), "MMM d, yyyy • h:mm a")}
                                </span>
                                <Link 
                                    to={`/articles/${item.article?._id}`} 
                                    className="flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    View Thread <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                            
                            <p className="mb-3 text-gray-300">"{item.content}"</p>
                            
                            {item.article && (
                                <div className="flex items-center gap-2 rounded-lg bg-black/20 p-2 text-xs text-gray-400">
                                    <span className="font-semibold text-gray-500">On:</span>
                                    <span className="truncate text-gray-300">{item.article.title}</span>
                                </div>
                            )}

                            {item.parentComment && (
                                 <div className="mt-2 text-xs text-gray-500">
                                     Replying to <span className="text-gray-400">@{item.parentComment.user?.username || 'someone'}</span>
                                 </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-10 text-center text-gray-500">
                    <p>No activity yet. Go join the discussion!</p>
                    <Link to="/" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                        Browse News
                    </Link>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
