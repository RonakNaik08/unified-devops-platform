import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Play,
  Wrench,
  Terminal,
  Container,
  Lock,
  FileCode,
  ShieldCheck,
  Activity,
  Cpu,
  CornerDownLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface AIChatBotDrawerProps {
  onNavigateTab: (tabId: string) => void;
  onOpenAssetGenerator: () => void;
  onOpenSecrets: () => void;
  onOpenCompliance: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; type: string; [key: string]: any }>;
}

export const AIChatBotDrawer: React.FC<AIChatBotDrawerProps> = ({
  onNavigateTab,
  onOpenAssetGenerator,
  onOpenSecrets,
  onOpenCompliance
}) => {
  const {
    activeProject,
    executeRealPipeline,
    runSecurityRemediation,
    setIsTerminalOpen,
    launchDevOpsTool
  } = useDevSecOps();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `👋 **Hi Ronak! I'm your AI DevOps & SRE Copilot Robot.**\n\nI am connected to your active workspace (\`${activeProject?.name || 'Projectt'}\`), local Docker daemon, and host system.\n\nAsk me anything about your infrastructure, security audits, Docker containers, or Kubernetes configs!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '🛡️ Audit Security', type: 'check_security' },
        { label: '⚡ Check Host CPU/RAM', type: 'check_health' },
        { label: '▶ Run Build & Deploy', type: 'run_build' },
        { label: '✨ Generate Dockerfile & K8s', type: 'open_assets' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenEvent);
    return () => window.removeEventListener('open-ai-chat', handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'I am analyzing your infrastructure...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: data.actions || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ **AI Copilot Connection Error:** ${err.message || 'Could not reach AI backend service.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: { label: string; type: string; [key: string]: any }) => {
    switch (action.type) {
      case 'run_build':
        executeRealPipeline();
        break;
      case 'remediate':
        runSecurityRemediation();
        break;
      case 'terminal':
        setIsTerminalOpen(true);
        break;
      case 'open_assets':
        onOpenAssetGenerator();
        break;
      case 'open_secrets':
        onOpenSecrets();
        break;
      case 'open_compliance':
        onOpenCompliance();
        break;
      case 'check_security':
        handleSendMessage('Check my security audit and vulnerabilities');
        break;
      case 'check_health':
        handleSendMessage('What is the current host CPU and memory utilization?');
        break;
      case 'launch_tool':
        if (action.tool) launchDevOpsTool(action.tool, 'start');
        break;
      case 'navigate':
        if (action.tab) onNavigateTab(action.tab);
        break;
      default:
        handleSendMessage(action.label);
    }
  };

  const quickPrompts = [
    '🛡️ Audit security',
    '⚡ Host CPU/RAM',
    '✨ Generate Dockerfile',
    '🐳 Docker status',
    '🚀 Run build'
  ];

  return (
    <>
      {/* Floating Robot Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 group">
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
            title="Open AI DevOps SRE Copilot"
          >
            <Bot className="w-7 h-7 animate-bounce-subtle" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090d16] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </span>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800">
            🤖 AI DevOps Copilot
          </div>
        </div>
      )}

      {/* Floating AI Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-[#0d1527] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden animate-scale-up ${
            isExpanded
              ? 'w-[700px] h-[80vh] max-w-[95vw]'
              : 'w-[420px] h-[580px] max-w-[95vw]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#101b38] to-[#0d1627] border-b border-slate-800/90 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0d1627]"></span>
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5 tracking-tight">
                  <span>AI DevOps SRE Robot</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  {activeProject?.name || 'Local Workspace'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat History"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore' : 'Expand'}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#090e1c] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                disabled={isTyping}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-blue-600/30 hover:text-blue-300 border border-slate-700/60 text-[10px] font-medium text-slate-300 transition-all shrink-0 active:scale-95"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#070b14] text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    {msg.sender === 'user' ? 'You' : 'DevOps AI'}
                  </span>
                  <span className="text-[9px] text-slate-600">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-600/20'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-xs shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 max-w-[140px] text-slate-400 animate-pulse">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Prompt Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0b101c] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. check cpu, fix cves, generate k8s yaml)..."
              disabled={isTyping}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500 font-medium"
            />

            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-40"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
