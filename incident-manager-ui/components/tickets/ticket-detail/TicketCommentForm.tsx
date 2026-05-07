'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useState } from 'react';

export function TicketCommentForm() {
  const [comment, setComment] = useState('');

  return (
    <ContentPanel title='Add Comment'>
      <div className="relative">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[120px] resize-none bg-secondary/30 pr-14 pb-14"
        />
        <Button
          type="button"
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full shadow-md"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </ContentPanel>
  );
}
