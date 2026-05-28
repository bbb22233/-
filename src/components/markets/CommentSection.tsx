'use client'

import { useState } from 'react'
import { Heart, Send } from 'lucide-react'
import { Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

interface CommentSectionProps {
  comments: Comment[]
  onOpenLogin: () => void
}

export function CommentSection({ comments: initial, onOpenLogin }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState('')
  const [liked, setLiked] = useState<Set<string>>(new Set())

  const handlePost = () => {
    if (!user) { onOpenLogin(); return }
    if (!text.trim()) return
    const newComment: Comment = {
      id: String(Date.now()),
      userId: user.id,
      username: user.username,
      content: text,
      timestamp: new Date().toISOString(),
      likes: 0,
    }
    setComments(prev => [newComment, ...prev])
    setText('')
  }

  const handleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, likes: liked.has(id) ? c.likes - 1 : c.likes + 1 } : c
    ))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">评论 ({comments.length})</h3>

      {/* Input */}
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center text-xs text-white shrink-0 mt-1">
          {user ? user.username[0] : '?'}
        </div>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder={user ? '发表你的看法...' : '登录后发表评论'}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            onClick={!user ? onOpenLogin : undefined}
          />
          <Button size="icon" variant="secondary" onClick={handlePost}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs text-white font-bold shrink-0">
              {comment.username[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{comment.username}</span>
                <span className="text-xs text-gray-600">{formatDate(comment.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1 mt-1.5 text-xs transition-colors ${liked.has(comment.id) ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked.has(comment.id) ? 'fill-red-400' : ''}`} />
                {comment.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
