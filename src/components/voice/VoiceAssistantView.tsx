import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  Trash2, 
  ShieldCheck, 
  Bot, 
  User, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { queryGeminiVoiceAssistant } from '../../services/geminiService';

interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTaken?: string;
  isSensitive?: boolean;
  actionType?: string;
  actionPayload?: any;
  confirmationPrompt?: string;
  confirmed?: boolean;
}

export const VoiceAssistantView: React.FC<{ onNavigate: (tab: string, param?: string) => void }> = ({ onNavigate }) => {
  const { role } = useAuth();
  const { 
    applications, 
    riskFlags, 
    reviewCases, 
    policies,
    aiDecisions,
    generateReport 
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'vm_init',
      sender: 'assistant',
      text: `Hello! I am your TrustTrack Underwriting Voice Assistant powered by Google Gemini. You can speak or type inquiries regarding loan portfolios, flagged AI mismatches, human review queues, policy thresholds, and audit reports.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleProcessCommand(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [applications, riskFlags, reviewCases, policies]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use the text input below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const handleProcessCommand = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: VoiceMessage = {
      id: `vm_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setTextInput('');
    setIsProcessing(true);

    try {
      const mismatchesCount = riskFlags.filter(f => f.risk_type.includes('MISMATCH')).length;
      const context = {
        totalApps: applications.length,
        flaggedApps: applications.filter(a => a.application_status === 'flagged' || a.application_status === 'under_review').length,
        pendingReviews: reviewCases.filter(c => c.status === 'Pending Review' || c.status === 'Under Investigation').length,
        mismatches: mismatchesCount,
        userRole: role,
        sampleApplicants: applications.slice(0, 5).map(a => {
          const dec = aiDecisions.find(d => d.application_id === a.id);
          return {
            id: a.applicant_id,
            name: a.full_name,
            status: a.application_status,
            recommendation: dec?.recommendation
          };
        }),
        policies: policies.map(p => ({
          name: p.policy_name,
          threshold: `${p.operator} ${p.threshold_value} ${p.threshold_unit || ''}`
        }))
      };

      const result = await queryGeminiVoiceAssistant(query, context);

      const botMsg: VoiceMessage = {
        id: `vm_${Date.now() + 1}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: result.navigationTarget,
        isSensitive: result.isSensitiveAction,
        actionType: result.actionType,
        actionPayload: result.actionPayload,
        confirmationPrompt: result.confirmationPrompt,
        confirmed: false
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(result.reply);
    } catch (e) {
      console.error('Voice assistant error:', e);
      const errorMsg: VoiceMessage = {
        id: `vm_${Date.now() + 1}`,
        sender: 'assistant',
        text: 'I encountered an error processing your query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async (msgId: string, actionType?: string, payload?: any) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, confirmed: true } : m));

    if (actionType === 'GENERATE_REPORT') {
      const appTargetId = payload?.applicantId || 'LN001';
      const targetApp = applications.find(a => a.applicant_id.toLowerCase() === appTargetId.toLowerCase());
      if (targetApp) {
        speakText(`Generating official audit report for ${targetApp.applicant_id}. The PDF is downloading.`);
        await generateReport(targetApp.applicant_id);
      } else {
        speakText(`Could not find applicant ${appTargetId}.`);
      }
    } else if (actionType === 'OVERRIDE_DECISION') {
      onNavigate('human-review');
    } else if (actionType === 'MODIFY_POLICY') {
      onNavigate('loan-policies');
    }
  };

  const sampleCommands = [
    'How many loan applications are there?',
    'How many AI decisions are flagged?',
    'Show me the pending human reviews',
    'Summarise today\'s activity',
    'Generate an audit report for LN001',
    'Explain the current loan eligibility rules'
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#FF5B26]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">TrustTrack Voice Assistant</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF5B26]/15 text-[#FF7A00] border border-[#FF5B26]/30 uppercase">
              Powered by Gemini
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Voice-enabled conversational copilot for inspecting underwriting queues, risk alerts, and policy statistics with strict confirmation guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              ttsEnabled ? 'bg-[#FF5B26]/15 border-[#FF5B26]/30 text-[#FF7A00]' : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ttsEnabled ? 'Speech Feedback Active' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Voice Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Stream (8 cols) */}
        <div className="lg:col-span-8 glass-panel-elevated rounded-2xl p-5 flex flex-col h-[580px]">
          {/* Status Indicator Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                isListening ? 'bg-rose-500 animate-ping' : isProcessing ? 'bg-amber-400 animate-pulse' : isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="text-slate-300 font-medium">
                {isListening ? 'Listening to speech...' : isProcessing ? 'Gemini reasoning in progress...' : isSpeaking ? 'Speaking response...' : 'Assistant Ready'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Authenticated: {role.toUpperCase()}</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                  msg.sender === 'user'
                    ? 'bg-[#FF5B26] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-200'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  
                  {/* Sensitive Action Confirmation Card */}
                  {msg.isSensitive && !msg.confirmed && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Confirmation Required</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-snug">
                        {msg.confirmationPrompt || 'This is a sensitive underwriting action. Confirm to proceed:'}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmAction(msg.id, msg.actionType, msg.actionPayload)}
                          className="px-3 py-1.5 rounded-lg btn-primary-orange text-[11px] font-bold shadow-md shadow-orange-500/20 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm & Execute</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, confirmed: true } : m))}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.confirmed && (
                    <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Action confirmed and dispatched.</span>
                    </div>
                  )}

                  {/* Navigation Pill */}
                  {msg.actionTaken && (
                    <div className="mt-2 pt-2 border-t border-white/[0.08] flex justify-end">
                      <button
                        onClick={() => onNavigate(msg.actionTaken!)}
                        className="text-[11px] font-semibold text-[#FF8A00] hover:underline flex items-center gap-1"
                      >
                        <span>Open {msg.actionTaken.replace('-', ' ')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-white/50 block mt-1 text-right">{msg.timestamp}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3 text-xs items-center text-slate-400">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <span>Analyzing loan records with Gemini...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Speech Bar & Typing Fallback */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all shadow-lg flex items-center justify-center shrink-0 ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20' 
                    : 'bg-[#FF5B26] text-white hover:bg-[#FF6B00] shadow-orange-500/30'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isListening ? 'Listening to speech... Speak clearly...' : 'Ask a voice command or type your query...'}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleProcessCommand(textInput);
                  }}
                  className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => handleProcessCommand(textInput)}
                  disabled={!textInput.trim() || isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Voice Commands & Guardrails (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <span>Suggested Voice Inquiries</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click any question or speak aloud into your microphone:
            </p>

            <div className="space-y-2">
              {sampleCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProcessCommand(cmd)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-[#FF5B26]/10 border border-white/[0.06] hover:border-[#FF5B26]/30 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span>"{cmd}"</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#FF7A00] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/[0.08] text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sensitive Action Guardrails</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Voice commands operate strictly within institutional permissions ({role.toUpperCase()}). High-impact actions such as generating audit reports or overriding decisions require explicit user confirmation before execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
