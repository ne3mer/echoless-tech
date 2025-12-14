import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { MessageCircle, ThumbsUp, ThumbsDown, Trash2, Send, Loader2, User } from 'lucide-react';

const CommentItem = ({ comment, articleId, depth = 0 }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isOwner = user && user._id === comment.user?._id;
  const isAdmin = user?.role === 'admin';

  // Vote Mutation
  const voteMutation = useMutation({
    mutationFn: async (type) => {
      return await api.post(`/comments/${comment._id}/vote`, { type });
    },
    onSuccess: () => {
       queryClient.invalidateQueries(['comments', articleId]);
    }
  });

  // Reply Mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/articles/${articleId}/comments`, { 
        content: replyContent,
        parentComment: comment._id 
      });
    },
    onSuccess: () => {
      setIsReplying(false);
      setReplyContent('');
      queryClient.invalidateQueries(['comments', articleId]);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/comments/${comment._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', articleId]);
    }
  });

  const handleVote = (type) => {
    if (!user) return; // Trigger login modal ideally
    voteMutation.mutate(type);
  }

  return (
    <div className={`flex flex-col gap-2 ${depth > 0 ? 'mt-4 border-l-2 border-white/10 pl-4' : ''}`}>
      <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10 hover:border-white/10">
        
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-xs text-gray-400">
                    <User className="h-4 w-4" />
                 </div>
                 <div>
                    <span className={`text-sm font-semibold ${isOwner ? 'text-primary' : 'text-gray-200'}`}>
                        {comment.user?.username || 'Anonymous'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                        {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, p') : ''}
                    </span>
                 </div>
            </div>
            
            {(isOwner || isAdmin) && (
                <button 
                  onClick={() => deleteMutation.mutate()}
                  className="rounded p-1 text-gray-500 hover:bg-red-500/10 hover:text-red-500"
                  title="Delete Comment"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>

        {/* Content */}
        <p className="mb-3 text-sm leading-relaxed text-gray-300">
            {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-white/5 pt-2">
            
            {/* Voting */}
            <div className="flex items-center gap-1 rounded-lg bg-black/20 p-1">
                <button 
                    onClick={() => handleVote('upvote')} 
                    className={`rounded p-1 transition-colors ${comment.upvotes?.includes(user?._id) ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-green-400'}`}
                >
                    <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <span className={`text-xs font-bold ${comment.score > 0 ? 'text-green-400' : comment.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {comment.score || 0}
                </span>
                <button 
                    onClick={() => handleVote('downvote')} 
                    className={`rounded p-1 transition-colors ${comment.downvotes?.includes(user?._id) ? 'text-red-400 bg-red-400/10' : 'text-gray-500 hover:text-red-400'}`}
                >
                    <ThumbsDown className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Reply Button */}
            <button 
                onClick={() => setIsReplying(!isReplying)}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${isReplying ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <MessageCircle className="h-3.5 w-3.5" /> Reply
            </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <div className="relative">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${comment.user?.username}...`}
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        rows="2"
                        autoFocus
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <button 
                            onClick={() => setIsReplying(false)}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => replyMutation.mutate()}
                            disabled={!replyContent.trim()}
                            className="rounded bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            {replyMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin"/> : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
          <div className="replies">
              {comment.replies.map(reply => (
                  <CommentItem 
                    key={reply._id} 
                    comment={reply} 
                    articleId={articleId} 
                    depth={depth + 1} 
                  />
              ))}
          </div>
      )}
    </div>
  );
};

export default CommentItem;
