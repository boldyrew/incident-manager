'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

type InlineEditableMode = 'single' | 'multiline';

export interface InlineEditableProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  mode?: InlineEditableMode;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  label?: string;
  rows?: number;
  renderDisplay?: (value: string) => ReactNode;
}

const displayTriggerClassName =
  'w-full rounded-md px-2 py-1 -mx-2 text-left ring-1 ring-transparent transition-shadow hover:ring-border focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function InlineEditable({
  value,
  onSave,
  mode = 'single',
  placeholder,
  emptyText = 'Click to add…',
  disabled = false,
  className,
  displayClassName,
  inputClassName,
  label,
  rows = 4,
  renderDisplay,
}: InlineEditableProps) {
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEditing = useCallback(() => {
    if (disabled || saving) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  }, [disabled, saving, value]);

  const cancel = useCallback(() => {
    setDraft(value);
    setError(null);
    setEditing(false);
  }, [value]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (mode === 'single' && !trimmed) {
      setError('This field cannot be empty.');
      return;
    }
    if (trimmed === value.trim()) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(mode === 'single' ? trimmed : draft);
      setEditing(false);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [draft, mode, onSave, value]);

  const handleDisplayKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startEditing();
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      return;
    }
    if (mode === 'single' && e.key === 'Enter') {
      e.preventDefault();
      void save();
    }
    if (mode === 'multiline' && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void save();
    }
  };

  const displayValue = value.trim();
  const showEmpty = !displayValue;

  if (editing) {
    return (
      <div className={cn('space-y-2', className)}>
        {label ? (
          <label htmlFor={fieldId} className="sr-only">
            {label}
          </label>
        ) : null}
        {mode === 'single' ? (
          <Input
            id={fieldId}
            ref={inputRef as RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={saving}
            className={inputClassName}
            aria-invalid={Boolean(error)}
          />
        ) : (
          <Textarea
            id={fieldId}
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={saving}
            rows={rows}
            className={cn('min-h-[120px] resize-y', inputClassName)}
            aria-invalid={Boolean(error)}
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={cancel} disabled={saving}>
            Cancel
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      {label ? <span className="sr-only">{label}</span> : null}
      <button
        type="button"
        onClick={startEditing}
        onKeyDown={handleDisplayKeyDown}
        disabled={disabled}
        className={cn(displayTriggerClassName, displayClassName)}
        aria-label={label ? `Edit ${label}` : 'Edit'}
      >
        {renderDisplay ? (
          renderDisplay(value)
        ) : showEmpty ? (
          <span className="text-muted-foreground">{emptyText}</span>
        ) : mode === 'single' ? (
          value
        ) : (
          <span className="block whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {value}
          </span>
        )}
      </button>
    </div>
  );
}

export function InlineEditableText(
  props: Omit<InlineEditableProps, 'mode' | 'rows' | 'renderDisplay'> & {
    renderDisplay?: (value: string) => ReactNode;
  },
) {
  return <InlineEditable {...props} mode="single" />;
}

export function InlineEditableTextarea(props: Omit<InlineEditableProps, 'mode'>) {
  return <InlineEditable {...props} mode="multiline" />;
}
