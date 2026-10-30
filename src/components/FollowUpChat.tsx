'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, ChatMessage, ContentCategory } from '@/types';
import { MessageSquare, Send, Mic, MicOff, Loader2, Bot, User, CornerDownRight, AlertCircle, Quote } from 'lucide-react';

interface FollowUpChatProps {
  transcript: string;
  language: SupportedLanguage;
  contentType?: ContentCategory;
}

export function FollowUpChat({ transcript, language, contentType = 'technical' }: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceSupported(false);
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        if (language === 'hi') {
          recognition.lang = 'hi-IN';
        } else if (language === 'pa') {
          recognition.lang = 'pa-IN';
        } else {
          recognition.lang = 'en-US';
        }

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognition.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setInputText(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access denied. You can continue by typing your question.');
          } else {
            setErrorMessage(`Microphone status: ${event.error}. You can type below.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Browser speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
      }
    }
  };

  const handleSendQuestion = async (questionToSend?: string) => {
    const q = (questionToSend || inputText).trim();
    if (!q || isAsking) return;

    setErrorMessage(null);
    setInputText('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          transcript,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceReference: data.sourceReference,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with assistant.');
    } finally {
      setIsAsking(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Dynamic chips based on content type
  const getQuickPrompts = (): string[] => {
    if (language === 'hi') {
      return contentType === 'personal'
        ? ['इस कहानी की मुख्य सीख क्या है?', 'मुख्य अनुभव को सरल शब्दों में समझाएं।', 'क्या इसमें कोई अन्य विवरण है?']
        : ['मुख्य बिंदु क्या है?', 'कृपया इसे सरल भाषा में समझाएं।', 'मुझे आगे क्या ध्यान रखना चाहिए?'];
    }
    if (language === 'pa') {
      return contentType === 'personal'
        ? ['ਇਸ ਕਹਾਣੀ ਦਾ ਮੁੱਖ ਸੰਦੇਸ਼ ਕੀ ਹੈ?', 'ਮੁੱਖ ਤਜ਼ਰਬੇ ਨੂੰ ਸਰਲ ਸ਼ਬਦਾਂ ਵਿੱਚ ਦੱਸੋ।', 'ਕੀ ਕੋਈ ਹੋਰ ਵੇਰਵਾ ਹੈ?']
        : ['ਮੁੱਖ ਨੁਕਤਾ ਕੀ ਹੈ?', 'ਕਿਰਪਾ ਕਰਕੇ ਇਸਨੂੰ ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ।', 'ਅਗਲਾ ਕਦਮ ਕੀ ਹੋਵੇਗਾ?'];
    }
    // English default
    if (contentType === 'personal') {
      return [
        'What is the central experience described?',
        'What key lessons or reflections can be drawn?',
        'Can you explain the setting in more detail?',
      ];
    }
    if (contentType === 'educational') {
      return [
        'What is the primary takeaway?',
        'Can you simplify the main explanation?',
        'Why is this subject important?',
      ];
    }
    return [
      'What is the purpose of this instruction?',
      'Can you explain this step in more detail?',
      'What common mistake should I avoid?',
    ];
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="h-4 w-4" />
          <span>Grounded Follow-Up Q&amp;A</span>
        </div>

        <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          Source-Grounded Answers
        </span>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-medium">Suggested Questions:</span>
        <div className="flex flex-wrap gap-2">
          {getQuickPrompts().map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAsking}
              onClick={() => handleSendQuestion(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 py-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 rounded-md bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-indigo-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-none space-y-2'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.sourceReference && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-1.5">
                    <Quote className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="italic">&ldquo;{msg.sourceReference}&rdquo;</span>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Analyzing source context...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-slate-950 border border-red-900/50 rounded-lg flex items-center space-x-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion();
        }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAsking}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Ask a question about this content (or use voice)...'
            }
            className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              isListening ? 'border-indigo-500/80 ring-1 ring-indigo-500/50' : 'border-slate-800'
            }`}
          />
        </div>

        {/* Voice dictation toggle button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={isAsking}
          title={isListening ? 'Stop recording' : 'Dictate question via microphone'}
          className={`p-2.5 rounded-lg border transition shrink-0 ${
            isListening
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isAsking}
          className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-40 shrink-0"
          title="Send question"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
