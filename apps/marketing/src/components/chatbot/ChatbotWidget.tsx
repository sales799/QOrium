'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot, ExternalLink, Loader2, Send, Sparkles } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { shouldShowChatbot } from '@/lib/chatbot-visibility';
import { cn } from '@/lib/cn';

interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt?: string;
}

interface ChatLine {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

type ChatbotEnvelope<T> =
  | {
      ok: true;
      data: T;
      error: null;
    }
  | {
      ok: false;
      data: null;
      error: { code: string; message: string } | null;
    };

interface MessageResponse {
  reply: string;
  intent: string;
  citations: Citation[];
  escalate?: boolean;
}

const starterQuestions = [
  'What is ReadyBank?',
  'How does anti-leak work?',
  'Do you have an AI Interviewer?',
];

export function ChatbotWidget() {
  const pathname = usePathname();
  const hidden = !shouldShowChatbot(pathname);
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatLine[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [leadVisible, setLeadVisible] = React.useState(false);
  const [visited, setVisited] = React.useState(true);

  React.useEffect(() => {
    const seen = window.localStorage.getItem('qorium-chatbot-seen') === '1';
    setVisited(seen);
    if (!seen) window.localStorage.setItem('qorium-chatbot-seen', '1');
  }, []);

  React.useEffect(() => {
    if (!open || sessionId) return;
    void createSession(pathname).then((session) => {
      if (!session) return;
      setSessionId(session.sessionId);
      setMessages([
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: session.greeting,
        },
      ]);
      track('chatbot_opened', { page_path: pathname });
    });
  }, [open, pathname, sessionId]);

  if (hidden) return null;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen && sessionId) {
      track('chatbot_session_ended', { page_path: pathname });
    }
  }

  async function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !sessionId || isLoading) return;

    const userLine: ChatLine = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((current) => [...current, userLine]);
    setInput('');
    setIsLoading(true);
    track('chatbot_message_sent', { page_path: pathname });

    const res = await postJson<MessageResponse>('/api/chatbot/message', {
      sessionId,
      message: trimmed,
      pagePath: pathname,
    });
    setIsLoading(false);

    if (!res?.ok || !res.data) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'QOrium chat is unavailable right now.',
        },
      ]);
      return;
    }

    setLeadVisible(Boolean(res.data.escalate));
    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply,
        citations: res.data.citations,
      },
    ]);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.button
          type="button"
          aria-label="Open QOrium chatbot"
          className={cn(
            'fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-2 rounded-md border border-product-500/30 bg-product-500 px-4 text-sm font-semibold text-white shadow-2xl shadow-product-500/20 transition-colors hover:bg-product-500/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500',
            !visited && 'ring-2 ring-product-500/20',
          )}
          {...(prefersReducedMotion ? {} : { whileHover: { y: -2 }, whileTap: { scale: 0.98 } })}
        >
          <Bot className="size-5 text-white" />
          Ask QOrium
        </motion.button>
      </DialogTrigger>

      <DialogContent className="bottom-0 left-0 top-auto flex h-[100dvh] max-w-none translate-x-0 translate-y-0 grid-rows-none flex-col gap-0 overflow-hidden border-product-500/20 bg-white p-0 text-graphite-900 shadow-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:h-[640px] sm:w-[450px] sm:rounded-lg">
        <DialogHeader className="border-b border-graphite-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-md bg-product-500 text-white">
              <Sparkles className="size-5" />
            </span>
            <div>
              <DialogTitle>QOrium answer desk</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Evidence-led buyer support
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className="flex-1 space-y-4 overflow-y-auto bg-graphite-50 px-4 py-5"
          aria-live="polite"
          aria-label="QOrium chatbot messages"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Checking cited surfaces
            </div>
          ) : null}
          <AnimatePresence>
            {leadVisible ? <LeadCaptureForm sessionId={sessionId} /> : null}
          </AnimatePresence>
        </div>

        <div className="border-t border-graphite-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {starterQuestions.map((question) => (
              <button
                key={question}
                type="button"
                className="rounded-md border border-graphite-200 bg-white px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-product-100 hover:text-graphite-900"
                onClick={() => void submitMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-graphite-200 bg-white px-3 py-2 text-sm text-graphite-900 outline-none placeholder:text-muted-foreground focus:border-product-500"
              placeholder="Ask about QOrium"
              maxLength={1000}
            />
            <button
              type="submit"
              aria-label="Send message"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-product-500 text-white transition-colors hover:bg-product-500/90 disabled:opacity-50"
              disabled={!input.trim() || isLoading || !sessionId}
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MessageBubble({ message }: { message: ChatLine }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[84%] rounded-md px-3 py-2 text-sm leading-6',
          isUser
            ? 'bg-product-500 text-white'
            : 'border border-graphite-200 bg-white text-graphite-900',
        )}
      >
        <p>{message.content}</p>
        {message.citations && message.citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.citations.map((citation) => (
              <a
                key={citation.id}
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-graphite-200 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-product-100 hover:text-graphite-900"
                onClick={() =>
                  track('chatbot_citation_clicked', {
                    page_path: window.location.pathname,
                    citation_url: citation.url,
                  })
                }
              >
                {citation.title}
                <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LeadCaptureForm({ sessionId }: { sessionId: string | null }) {
  const pathname = usePathname();
  const [state, setState] = React.useState<'idle' | 'sending' | 'sent'>('idle');
  const [fields, setFields] = React.useState({
    email: '',
    company: '',
    role: '',
    need: '',
  });

  if (state === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-md border border-product-500/30 bg-product-100 p-3 text-sm text-graphite-900"
      >
        A human will reach out within 4 business hours.
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-2 rounded-md border border-graphite-200 bg-white p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setState('sending');
        const res = await postJson('/api/chatbot/lead-capture', {
          sessionId: sessionId ?? undefined,
          ...fields,
          pagePath: pathname,
        });
        setState(res?.ok ? 'sent' : 'idle');
        if (res?.ok) {
          track('chatbot_demo_requested', { page_path: pathname });
          track('chatbot_human_escalated', { page_path: pathname });
        }
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <LeadInput
          value={fields.email}
          onChange={(email) => setFields((current) => ({ ...current, email }))}
          type="email"
          placeholder="Work email"
        />
        <LeadInput
          value={fields.company}
          onChange={(company) => setFields((current) => ({ ...current, company }))}
          placeholder="Company"
        />
        <LeadInput
          value={fields.role}
          onChange={(role) => setFields((current) => ({ ...current, role }))}
          placeholder="Role"
        />
        <LeadInput
          value={fields.need}
          onChange={(need) => setFields((current) => ({ ...current, need }))}
          placeholder="Need"
        />
      </div>
      <button
        type="submit"
        disabled={state === 'sending'}
        className="inline-flex h-9 w-full items-center justify-center rounded-md bg-product-500 text-sm font-semibold text-white disabled:opacity-50"
      >
        {state === 'sending' ? 'Sending' : 'Request human follow-up'}
      </button>
    </motion.form>
  );
}

function LeadInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'text' | 'email';
}) {
  return (
    <input
      required
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      maxLength={120}
      className="min-w-0 rounded-md border border-graphite-200 bg-white px-3 py-2 text-sm text-graphite-900 outline-none placeholder:text-muted-foreground focus:border-product-500"
    />
  );
}

async function createSession(pagePath: string) {
  const res = await postJson<{ sessionId: string; greeting: string }>('/api/chatbot/session', {
    pagePath,
  });
  return res?.ok ? res.data : null;
}

async function postJson<T = unknown>(
  url: string,
  body: unknown,
): Promise<ChatbotEnvelope<T> | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return (await res.json()) as ChatbotEnvelope<T>;
  } catch {
    return null;
  }
}

function track(event: string, props: Record<string, unknown> = {}) {
  const win = window as Window & {
    plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
  };
  win.plausible?.(event, { props });
}
