import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Shield, Cpu, Activity, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { devOpsService, type Message } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await devOpsService.sendMessage(messages, userMessage);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Failed to establish connection to the control plane.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text font-sans">
      {/* Header / Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terminal-accent/10 rounded-lg border border-terminal-accent/30">
            <Shield className="w-5 h-5 text-terminal-accent" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2">
              DevOps Sentinel <span className="text-[10px] bg-terminal-accent text-white px-1 rounded">v2.5</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent animate-pulse" />
              <span className="text-[10px] text-terminal-text/50 font-mono uppercase tracking-widest">System Operational</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-terminal-text/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              <span>CPU: 12%</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Latency: 42ms</span>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-white/5 rounded-md transition-colors text-terminal-text/60 hover:text-red-400"
            title="Purge Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-60">
            <Terminal className="w-12 h-12 text-terminal-accent mb-2" />
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-terminal-text">Control Plane Initialized</h2>
              <p className="text-sm text-terminal-text/60 font-mono">
                Ready for infrastructure queries. Provide parameters for deployment, scaling, or troubleshooting.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full text-left font-mono text-[11px]">
              {[
                "How to optimize Kubernetes resource limits?",
                "Explain blue-green deployment strategy.",
                "Terraform state locking best practices.",
                "Debug 502 Bad Gateway in Nginx."
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-3 bg-white/5 border border-terminal-border rounded hover:border-terminal-accent/50 hover:bg-terminal-accent/5 transition-all group flex items-center justify-between"
                >
                  <span>{suggestion}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-3xl mx-auto",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "flex items-center gap-2 mb-1 text-[10px] font-mono uppercase tracking-widest opacity-40",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <span>{msg.role === 'user' ? 'Operator' : 'Sentinel'}</span>
                <span>•</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className={cn(
                "px-4 py-3 rounded-lg text-sm transition-all",
                msg.role === 'user' 
                  ? "bg-terminal-accent/10 border border-terminal-accent/30 text-terminal-text"
                  : "bg-white/5 border border-terminal-border text-terminal-text/90"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-start max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono uppercase tracking-widest opacity-40">
              <span>Sentinel</span>
              <span>•</span>
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
            <div className="bg-white/5 border border-terminal-border px-4 py-3 rounded-lg flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-6 bg-black/20 border-t border-terminal-border">
        <form 
          onSubmit={handleSend}
          className="max-w-3xl mx-auto relative"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-accent/50">
            <Terminal className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or query..."
            className="w-full bg-white/5 border border-terminal-border rounded-lg pl-11 pr-12 py-3 text-sm focus:outline-none focus:border-terminal-accent/50 focus:ring-1 focus:ring-terminal-accent/20 transition-all font-mono"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-terminal-accent text-white rounded-md hover:bg-terminal-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-terminal-accent/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-terminal-text/30 mt-4 font-mono uppercase tracking-[0.2em]">
          End-to-end encrypted session • Precise DevOps Intelligence
        </p>
      </footer>
    </div>
  );
}
