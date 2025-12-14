import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Loader2, Send, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const CommentSection = ({ articleId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  // Fetch Comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const { data } = await api.get(`/articles/${articleId}/comments`);
      return data;
    },
  });

  // Add Comment Mutation
  const mutation = useMutation({
    mutationFn: async (newComment) => {
      return await api.post(`/articles/${articleId}/comments`, { content: newComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', articleId]);
      setContent('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate(content);
  };

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-surface/30 p-6 backdrop-blur-md">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
        <MessageCircle className="h-5 w-5 text-primary" />
        Discussion ({comments?.length || 0})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Join the discussion..."
              className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows="3"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !content.trim()}
              className="absolute bottom-3 right-3 rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary/80 disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-gray-400">
          <a href="/login" className="font-medium text-primary hover:underline">
            Login
          </a>{' '}
          to leave a comment.
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments?.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 drop-shadow-md">
                 <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-gray-200">{comment.user?.username || 'Anonymous'}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM d, p')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">No comments yet. Be the first to start the conversation!</p>
      )}
    </div>
  );
};

export default CommentSection;
