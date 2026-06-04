'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIncidentDetail } from '@/context/incident-context';
import { addIncidentComment } from '@/lib/api';
import { Loader2, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function IncidentCommentForm() {
  const { incidentId, refetchActivities } = useIncidentDetail();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = comment.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await addIncidentComment(incidentId, trimmed);
      setComment('');
      await refetchActivities();
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ContentPanel title="Add Comment">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[120px] resize-none bg-secondary/30 pr-14 pb-14"
          disabled={submitting}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full shadow-md"
          aria-label="Send comment"
          disabled={!canSubmit}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </form>
    </ContentPanel>
  );
}
