import { useRef, useState, useEffect, type FormEvent } from "react";
import {
  Activity, ArrowRight, ArrowUp, AtSign, ChevronDown, 
  Cpu, Database, Info, Menu, MessageSquare, 
  Palette, Plus, Settings2, ShieldAlert, Sparkles, X, Lock, Code2, Check, Loader2, Trash2, Download, FolderArchive, Key, RotateCcw, Sun, Moon, Copy, Terminal, Image as ImageIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import JSZip from "jszip";
import { useChat } from "../hooks/useChat";
import { useMemory } from "../hooks/useMemory";
import { LogoIcon } from "../components/CyberXLogo";
import type { Mode } from "../types/settings";

// 🟢 Custom Code Block with Copy Button
function CodeBlock({ language, children, theme }: { language: string, children: string, theme: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden my-4 border border-black/10 dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-[#1a1a1a] border-b border-black/10 dark:border-white/10">
        <span className="text-[10px] font-mono uppercase text-neutral-500">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors bg-white dark:bg-[#252525] hover:bg-neutral-200 dark:hover:bg-[#333] px-2.5 py-1 rounded-md border border-black/5 dark:border-white/5">
          {copied ? <><Check size={12} className="text-green-500" /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <SyntaxHighlighter style={vscDarkPlus as any} language={language || 'text'} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: theme === 'dark' ? '#0d0d0d' : '#fafafa', fontSize: '13px' }}>
        {children.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}

export default function TerminalPage() {
  const [view, setView] = useState<"home" | "chat">("home");
  const [prompt, setPrompt] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 🟢 Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"api" | "appearance" | "data" | "info">("api");
  
  const [provider, setProvider] = useState("Local Router (FreeLLMAPI)");
  const [model, setModel] = useState("auto");
  const [temperature, setTemperature] = useState(0.0);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:31415/v1");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const memory = useMemory();
  const [facts, setFacts] = useState(memory.getAllFacts());
  const [newFact, setNewFact] = useState("");

  const [mode, setMode] = useState<Mode>("PENTEST"); 
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("cyberx_apikey");
    const savedUrl = localStorage.getItem("cyberx_baseurl");
    const savedModel = localStorage.getItem("cyberx_model");
    const savedTemp = localStorage.getItem("cyberx_temp");
    const savedTheme = localStorage.getItem("cyberx_theme") as "dark" | "light";
    
    if (savedKey) setApiKey(savedKey);
    if (savedUrl) setBaseUrl(savedUrl);
    if (savedModel) setModel(savedModel);
    if (savedTemp) setTemperature(parseFloat(savedTemp));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("cyberx_apikey", apiKey);
    localStorage.setItem("cyberx_baseurl", baseUrl);
    localStorage.setItem("cyberx_model", model);
    localStorage.setItem("cyberx_temp", temperature.toString());
    localStorage.setItem("cyberx_theme", theme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const changeTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("cyberx_theme", newTheme);
  };

  const testConnection = async () => {
    if (!apiKey) { setTestStatus("error"); setTestMessage("API Key is required."); return; }
    setTestStatus("loading"); setTestMessage("");
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: model || "auto", messages: [{ role: "user", content: "ping" }], max_tokens: 1, stream: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestStatus("success"); setTestMessage(`Connected — ${data.model || model}`);
      } else {
        const err = await res.json().catch(() => ({}));
        setTestStatus("error"); setTestMessage(err?.error?.message || `Failed with status ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus("error"); setTestMessage(err.message || "Network error.");
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(chat.conversations, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `cyberx-chats-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const exportZIP = async () => {
    const zip = new JSZip();
    zip.file(`cyberx-chats-${Date.now()}.json`, JSON.stringify(chat.conversations, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a"); a.href = url; a.download = `cyberx-archive-${Date.now()}.zip`; a.click(); URL.revokeObjectURL(url);
  };

  const clearApiKey = () => {
    if(confirm("Clear API Key?")) { localStorage.removeItem("cyberx_apikey"); setApiKey(""); setTestStatus("idle"); }
  };

  const resetApp = () => {
    if(confirm("Reset the app? This deletes all data including chats and settings.")) { localStorage.clear(); window.location.reload(); }
  };

  const addMemoryFact = () => { if(!newFact.trim()) return; memory.addFact(newFact.trim()); setFacts(memory.getAllFacts()); setNewFact(""); };
  const removeMemoryFact = (id: string) => { memory.removeFact(id); setFacts(memory.getAllFacts()); };

  const chat = useChat({
    baseUrl: baseUrl, model: model, apiKey: apiKey, temperature: temperature, mode: mode, 
  });

  const messages = chat.active?.messages || [];

  useEffect(() => {
    if (chatEndRef.current) { chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  // 🟢 Image Upload Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  function handleStartChat(initialText = "") {
    if (!apiKey) { setSettingsOpen(true); return; }
    setView("chat"); setSidebarOpen(false);
    if (initialText.trim()) { chat.sendMessage(initialText.trim()); setPrompt(""); }
    window.setTimeout(() => { if (inputRef.current) { inputRef.current.style.height = 'auto'; inputRef.current.focus(); } }, 80);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if ((!prompt.trim() && !selectedImage) || chat.isStreaming) return; 
    if (!apiKey) { setSettingsOpen(true); return; }
    
    // 🟢 Send image with message
    chat.sendMessage(prompt.trim(), selectedImage || undefined); 
    
    setPrompt(""); setSelectedImage(null); 
    if (inputRef.current) inputRef.current.style.height = 'auto';
  }

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      chat.deleteConversation(id);
      if (chat.activeId === id) setView("home");
    }
  };

  const modes: { id: Mode; label: string; icon: any }[] = [
    { id: "PENTEST", label: "Pentest", icon: ShieldAlert },
    { id: "CODE", label: "Code", icon: Code2 },
    { id: "IOT", label: "IoT Lab", icon: Cpu },
    { id: "DEFENSE", label: "Defense", icon: Lock },
  ];

  return (
    <div className={`${theme === "dark" ? "dark" : ""} h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300`}>
      <div className="flex h-full">
        {sidebarOpen && <button className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0d0d0d] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          <div className="flex h-[76px] items-center justify-between px-5 border-b border-black/5 dark:border-white/[0.04]">
            <button className="flex items-center gap-3" onClick={() => { setView("home"); setSidebarOpen(false); }}>
              <LogoIcon className="w-9 h-9" />
              <span className="text-left">
                <span className="block text-[14px] font-bold tracking-wide text-black dark:text-white">CYBER-X 2.0</span>
                <span className="mt-0.5 block text-[9px] leading-tight text-neutral-500">One space for ideas, code,<br/>research, and questions.</span>
              </span>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 lg:hidden">
              <X size={18} />
            </button>
          </div>

          <div className="px-3 pt-4">
            <button onClick={() => { setView("chat"); chat.startNewSession(); setSidebarOpen(false); }} className="flex w-full items-center gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] px-3 py-3 text-sm text-black dark:text-white transition hover:bg-black/10 dark:hover:bg-white/10">
              <Plus size={16} /><span>New conversation</span>
            </button>
          </div>

          <div className="mt-8 px-5"><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-600">Workspace</p></div>
          <nav className="mt-3 space-y-1 px-3">
            <button onClick={() => { setView("home"); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${view === "home" ? "bg-black/[0.05] dark:bg-white/[0.07] text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"}`}><Activity size={16} /> Overview</button>
            <button onClick={() => { setView("chat"); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${view === "chat" ? "bg-black/[0.05] dark:bg-white/[0.07] text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"}`}><MessageSquare size={16} /> AI assistant</button>
          </nav>

          <div className="mt-8 px-5"><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-600">Recent</p></div>
          <div className="mt-3 space-y-1 px-3 flex-1 overflow-y-auto">
            {chat.conversations.slice(0, 15).map((conv) => (
              <div key={conv.id} className="group relative flex items-center">
                <button 
                  onClick={() => { chat.selectConversation(conv.id); setView("chat"); }} 
                  className={`flex flex-1 items-center gap-3 truncate rounded-lg px-3 py-2 text-left text-xs transition-colors ${chat.activeId === conv.id ? 'bg-black/[0.05] dark:bg-white/[0.07] text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'}`}
                >
                  <MessageSquare size={14} className="shrink-0" /> 
                  <span className="truncate">{conv.title}</span>
                </button>
                <button onClick={(e) => handleDeleteChat(e, conv.id)} className="absolute right-1 p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Delete Chat">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto p-3 border-t border-black/5 dark:border-white/[0.05]">
            <button onClick={() => setSettingsOpen(true)} className="flex w-full items-center gap-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/[0.08] hover:text-black dark:hover:text-white transition">
              <Settings2 size={18} /> Settings
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-neutral-50 dark:bg-[#050505]">
          
          <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-black/10 dark:border-white/[0.07] bg-neutral-50 dark:bg-[#050505] px-4 sm:px-7">
            <div className="flex flex-1 items-center gap-4">
              <button className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/[0.06] lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu size={19} />
              </button>
              <div className="flex items-center gap-2">
                <LogoIcon className="w-7 h-7" />
                <span className="text-[14px] font-bold tracking-wide text-black dark:text-white hidden sm:block">CYBER-X 2.0</span>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] p-1.5 shadow-sm dark:shadow-2xl">
                {modes.map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all duration-300 ${ mode === m.id ? "bg-neutral-200 dark:bg-[#222] text-black dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]" }`}>
                    <m.icon size={14} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
              <button onClick={() => setSettingsOpen(true)} className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#111] px-3 py-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white sm:flex">
                <span className={`h-1.5 w-1.5 rounded-full ${apiKey ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} /> 
                {apiKey ? 'AGENT ACTIVE' : 'SET API KEY'}
              </button>
            </div>
          </header>

          {view === "home" ? (
            <div className="relative flex-1 overflow-y-auto">
              <section className="relative isolate flex min-h-[510px] flex-col items-center justify-center overflow-hidden px-5 py-16 text-center">
                <div className="mb-7 flex items-center gap-2 rounded-full border border-black/10 dark:border-white/[0.12] bg-white dark:bg-[#111] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  <Sparkles size={12} /> An intelligent workspace
                </div>
                <h1 className="animate-rise max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.055em] text-black dark:text-white sm:text-6xl lg:text-7xl">
                  Think beyond<br /><span className="text-neutral-400 dark:text-neutral-500">the ordinary.</span>
                </h1>
                <p className="animate-rise mt-6 max-w-lg text-sm leading-7 text-neutral-600 dark:text-neutral-400 [animation-delay:100ms] sm:text-base">
                  One space for ideas, code, research, and the questions that move your work forward.
                </p>
                <div className="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3 [animation-delay:180ms]">
                  <button onClick={() => handleStartChat()} className="group inline-flex items-center gap-2 rounded-full bg-black dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-black transition hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:scale-105">
                    Start a conversation <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-4 pb-8 pt-8 sm:px-8">
                {messages.length === 0 ? (
                  <div className="mx-auto flex min-h-[58vh] max-w-3xl flex-col justify-center items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111] shadow-sm"><Sparkles size={22} strokeWidth={1.4} /></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">CYBER-X ASSISTANT</p>
                    <h2 className="mt-3 text-3xl font-medium tracking-tight text-neutral-800 dark:text-neutral-300 sm:text-4xl">What are we working on?</h2>
                  </div>
                ) : (
                  <div className="mx-auto max-w-3xl space-y-8 pb-10">
                    {messages.map((message) => (
                      <article key={message.id} className="animate-rise">
                        {message.role === "user" ? (
                          <div className="ml-auto flex max-w-[85%] justify-end">
                            {/* 🟢 USER MESSAGE WITH IMAGE */}
                            <div className="flex flex-col gap-2 rounded-2xl rounded-tr-sm bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 p-2 text-[15px] leading-7 text-black dark:text-white shadow-sm">
                              {message.image && (
                                <img src={message.image} alt="Uploaded" className="max-w-[250px] rounded-lg border border-black/10 dark:border-white/10" />
                              )}
                              {message.content && <span className="px-3">{message.content}</span>}
                            </div>
                          </div>
                        ) : message.role === "system" ? (
                          
                          <div className="my-6 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#0d0d0d] font-mono text-sm max-w-[90%]">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/10">
                              <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                                <Terminal size={14} /> SYSTEM EXECUTION
                              </div>
                              <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                              </div>
                            </div>
                            <div className="p-4 overflow-x-auto text-neutral-300 whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>

                        ) : (
                          <div className="flex items-start gap-4 max-w-[90%]">
                            <div className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border shadow-sm ${message.isError ? 'border-red-500/30 bg-red-500/10' : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#111]'}`}>
                              {message.isError ? <X size={14} className="text-red-500" /> : <Sparkles size={14} className="text-neutral-500 dark:text-neutral-300" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`mb-1.5 text-[11px] font-bold tracking-wider uppercase ${message.isError ? 'text-red-500' : 'text-neutral-500'}`}>
                                CYBER-X
                              </div>
                              <div className={`prose prose-sm dark:prose-invert max-w-none text-[15px] leading-7 ${message.isError ? "text-red-500" : "text-neutral-800 dark:text-neutral-200"}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                    code({node, inline, className, children, ...props}: any) {
                                      const match = /language-(\w+)/.exec(className || '')
                                      return !inline && match ? (
                                        <CodeBlock language={match[1]} theme={theme}>
                                          {String(children)}
                                        </CodeBlock>
                                      ) : (
                                        <code className={`${className} px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono text-[13px]`} {...props}>
                                          {children}
                                        </code>
                                      )
                                    }
                                  }}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
              
              {/* INPUT BOX */}
              <div className="shrink-0 w-full bg-gradient-to-t from-neutral-50 via-neutral-50 dark:from-[#050505] dark:via-[#050505] to-transparent px-4 pb-6 pt-4 sm:px-8 sm:pb-8">
                <div className="mx-auto max-w-3xl">
                  <form onSubmit={handleSubmit} className="relative flex flex-col rounded-[32px] border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] p-2 shadow-sm dark:shadow-[0_0_40px_rgba(0,0,0,1)] transition-all focus-within:border-black/30 dark:focus-within:border-white/[0.2]">
                    
                    {/* 🟢 IMAGE PREVIEW */}
                    {selectedImage && (
                      <div className="relative w-20 h-20 mb-2 ml-2 rounded-lg overflow-hidden border border-white/20">
                        <img src={selectedImage} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black">
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      <div className="flex items-center gap-1 pb-1 pl-2">
                         
                         {/* 🟢 IMAGE UPLOAD BUTTON */}
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full p-2 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 transition" title="Upload Image">
                           <ImageIcon size={18} />
                         </button>
                         <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

                         <button type="button" className="rounded-full p-2 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 transition"><AtSign size={18} /></button>
                      </div>

                      <textarea 
                        ref={inputRef} 
                        value={prompt} 
                        onChange={handleInput}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }} 
                        rows={1} 
                        placeholder="Ask anything or upload an image..." 
                        className="max-h-[150px] min-h-[44px] flex-1 resize-none bg-transparent border-none outline-none ring-0 focus:ring-0 focus:border-none focus:outline-none py-3 text-[15px] leading-6 text-black dark:text-white placeholder:text-neutral-500 overflow-y-auto" 
                      />

                      <div className="flex items-center gap-1 pb-1 pr-1">
                        <button type="submit" disabled={(!prompt.trim() && !selectedImage) || chat.isStreaming} className="grid h-9 w-9 place-items-center rounded-full bg-black dark:bg-white text-white dark:text-black transition hover:scale-105 disabled:scale-100 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:text-neutral-500 shadow-sm">
                          <ArrowUp size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </form>
                  <p className="mt-3 text-center text-[10px] text-neutral-500 dark:text-neutral-600">CYBER-X can make mistakes. Verify important information.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SETTINGS MODAL (Same as before) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 p-4 backdrop-blur-md">
          <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-black/10 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 p-5 bg-neutral-50 dark:bg-[#0d0d0d]">
              <h2 className="text-sm font-bold tracking-widest uppercase text-black dark:text-white">Settings</h2>
              <button onClick={() => setSettingsOpen(false)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition"><X size={18} /></button>
            </div>
            
            <div className="flex gap-2 border-b border-black/5 dark:border-white/10 px-4 pt-2 bg-neutral-50 dark:bg-[#0d0d0d]">
              {[
                { id: "api", label: "API", icon: Cpu },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "data", label: "Data", icon: Database },
                { id: "info", label: "Info", icon: Info },
              ].map(tab => (
                <button key={tab.id} onClick={() => setSettingsTab(tab.id as any)} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition ${settingsTab === tab.id ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-neutral-500 hover:text-black dark:hover:text-neutral-300"}`}>
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 bg-white dark:bg-[#0a0a0a] max-h-[70vh] overflow-y-auto">
              {settingsTab === "api" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">Provider</label>
                      <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-[#111] px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-black/30 dark:focus:border-white/30 appearance-none">
                        <option>Local Router (FreeLLMAPI)</option>
                        <option>Groq</option>
                        <option>OpenRouter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">Model</label>
                      <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="auto" className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-[#111] px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-black/30 dark:focus:border-white/30" />
                    </div>
                  </div>
                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                      <span>Temperature</span>
                      <span>{temperature.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-black dark:accent-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">API Key</label>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="freellmapi-..." className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-[#111] px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-black/30 dark:focus:border-white/30 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">Base URL</label>
                    <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://127.0.0.1:31415/v1" className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-[#111] px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-black/30 dark:focus:border-white/30 font-mono" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveSettings} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-white px-4 py-3 text-sm font-semibold text-white dark:text-black transition hover:bg-neutral-800 dark:hover:bg-neutral-200">
                      {isSaved ? <><Check size={16} /> Saved!</> : "Save Settings"}
                    </button>
                    <button onClick={testConnection} disabled={testStatus === 'loading'} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-black dark:text-white transition hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50">
                      {testStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : "Test Connection"}
                    </button>
                  </div>
                  {testStatus !== 'idle' && (
                    <div className={`mt-2 p-3 rounded-xl border text-xs font-medium ${testStatus === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' : testStatus === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400' : 'border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
                      {testStatus === 'success' ? `✓ ${testMessage}` : testStatus === 'error' ? `❌ ${testMessage}` : 'Testing...'}
                    </div>
                  )}
                </div>
              )}

              {settingsTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-black dark:text-white mb-3">Theme</h3>
                    <div className="flex gap-3">
                      <button onClick={() => changeTheme("dark")} className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 transition ${theme === "dark" ? "border-black dark:border-white bg-neutral-100 dark:bg-white/10" : "border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5"}`}>
                        <Moon size={20} className={theme === "dark" ? "text-black dark:text-white" : "text-neutral-500"} />
                        <span className="text-xs font-medium text-black dark:text-white">Dark</span>
                      </button>
                      <button onClick={() => changeTheme("light")} className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 transition ${theme === "light" ? "border-black dark:border-white bg-neutral-100 dark:bg-white/10" : "border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5"}`}>
                        <Sun size={20} className={theme === "light" ? "text-black dark:text-white" : "text-neutral-500"} />
                        <span className="text-xs font-medium text-black dark:text-white">Light</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "data" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-[#111] p-4">
                    <h3 className="text-sm font-medium text-black dark:text-white mb-1">Memory Manager</h3>
                    <p className="text-xs text-neutral-500 mb-3">Facts the AI will remember.</p>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newFact} onChange={(e) => setNewFact(e.target.value)} placeholder="e.g. I use Arch Linux" className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-xs text-black dark:text-white outline-none focus:border-black/30 dark:focus:border-white/30" />
                      <button onClick={addMemoryFact} className="rounded-lg bg-black dark:bg-white px-3 py-2 text-xs font-semibold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200">Add</button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {facts.length === 0 ? <p className="text-xs text-neutral-500 italic">No facts saved.</p> : facts.map(f => (
                        <div key={f.id} className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] rounded p-2 border border-black/5 dark:border-white/5">
                          <span className="text-xs text-black dark:text-neutral-300 truncate">{f.text}</span>
                          <button onClick={() => removeMemoryFact(f.id)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={exportJSON} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111] px-3 py-3 text-xs font-semibold text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition">
                      <Download size={14} /> Export JSON
                    </button>
                    <button onClick={exportZIP} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111] px-3 py-3 text-xs font-semibold text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition">
                      <FolderArchive size={14} /> Export ZIP
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <button onClick={clearApiKey} className="flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition">
                      <Key size={14} /> Clear API Key
                    </button>
                    <button onClick={resetApp} className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition">
                      <RotateCcw size={14} /> Reset App
                    </button>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Reset Conversations</h3>
                      <p className="text-xs text-neutral-500 mt-1">Delete all chat history permanently.</p>
                    </div>
                    <button onClick={() => { if(confirm("Are you sure you want to delete all conversations? This cannot be undone.")) { chat.clearAll(); setView("home"); } }} className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/30 transition">
                      <Trash2 size={14} /> Clear Chats
                    </button>
                  </div>

                </div>
              )}

              {settingsTab === "info" && (
                <div className="py-10 text-center flex flex-col items-center">
                  <LogoIcon className="w-12 h-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-black dark:text-white tracking-widest">CYBER-X 2.0</h3>
                  <p className="text-xs text-neutral-500 mt-2">Security Operations Terminal</p>
                  <p className="text-[10px] text-neutral-500 mt-4">Build 2026 • Powered by FreeLLMAPI</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
