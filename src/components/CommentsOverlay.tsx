"use client";

import { useState, useRef, useEffect } from "react";
import { X, Heart, MoreHorizontal, Reply, Bookmark, Flag, Link2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  comments: Comment[];
  onAddComment: (content: string, replyToId?: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentsOverlay = ({
  isOpen,
  onClose,
  postId,
  comments,
  onAddComment,
  onLikeComment,
}: CommentsOverlayProps) => {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment, replyingTo || undefined);
    setNewComment("");
    setReplyingTo(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleCopyUrl = (commentId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}?comment=${commentId}`);
    setActiveMenu(null);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-10 mt-3" : ""}`}>
      <div className="flex gap-3">
        <Avatar 
          className="h-8 w-8 cursor-pointer flex-shrink-0"
          onClick={() => router.push(`/user/${comment.user.username}`)}
        >
          <AvatarImage src={comment.user.avatar_url} />
          <AvatarFallback className="bg-muted text-xs">
            {comment.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={() => router.push(`/user/${comment.user.username}`)}
                style={{ fontFamily: 'InterVariable, system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 600 }}
              >
                {comment.user.name}
              </span>
              <span className="text-muted-foreground text-xs ml-2">
                {formatTime(comment.created_at)}
              </span>
            </div>
            
            {/* Three dots menu */}
            <div className="relative" ref={activeMenu === comment.id ? menuRef : null}>
              <button
                onClick={() => setActiveMenu(activeMenu === comment.id ? null : comment.id)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {activeMenu === comment.id && (
                <div className="absolute right-0 top-6 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => { setActiveMenu(null); }}
                    className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50"
                  >
                    <Bookmark className="h-4 w-4" />
                    Bookmark
                  </button>
                  <button
                    onClick={() => handleCopyUrl(comment.id)}
                    className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50"
                  >
                    <Link2 className="h-4 w-4" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); }}
                    className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50 text-red-500"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <p 
            className="text-sm mt-0.5 break-words"
            style={{ fontFamily: 'InterVariable, system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 400 }}
          >
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onLikeComment(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Heart className={`h-3.5 w-3.5 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 fade-in duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'InterVariable, system-ui, sans-serif', fontWeight: 600 }}
          >
            Comments
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Replying to {comments.find(c => c.id === replyingTo)?.user.name}
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-xs text-accent font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            style={{ fontFamily: 'InterVariable, system-ui, sans-serif', fontWeight: 400 }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim()}
            className="h-9 w-9 rounded-full bg-accent hover:bg-accent/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CommentsOverlay;

