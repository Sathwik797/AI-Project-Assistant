import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Layers, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  Bot
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/projects');
    } else {
      navigate('/login', { state: { message: 'Please sign in to start your work.' } });
    }
  };

  const solutionStages = [
    {
      num: '01',
      title: 'INGEST',
      subtitle: 'Project documents',
      desc: 'Upload PDF, DOCX, and TXT specifications, requirements files, architecture blueprints, and meeting notes.'
    },
    {
      num: '02',
      title: 'UNDERSTAND',
      subtitle: 'Extract & index knowledge',
      desc: 'SentenceTransformers and ChromaDB parse, chunk, and index text embeddings into project-isolated vector stores.'
    },
    {
      num: '03',
      title: 'ANALYZE',
      subtitle: 'Requirements · rules · risks',
      desc: 'Gemini LLM extracts functional specifications, identifies business rules, and surface specification conflicts.'
    },
    {
      num: '04',
      title: 'GENERATE',
      subtitle: 'Stories · criteria · tasks',
      desc: 'Automatically synthesize structured user stories with acceptance criteria checklists and engineering tasks.'
    },
    {
      num: '05',
      title: 'TRACE',
      subtitle: 'Connect evidence to work',
      desc: 'Maintain end-to-end evidence links from original document chunks to stories and sprint Kanban tasks.'
    },
    {
      num: '06',
      title: 'DELIVER',
      subtitle: 'Track actionable work',
      desc: 'Monitor sprint progress, review conflict resolutions, and export executive project briefs in Markdown.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFA] text-[#171717] font-sans selection:bg-amber-100 transition-colors duration-200">
      
      {/* SECTION 1 — NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-[#FCFCFA]/90 backdrop-blur-md border-b border-[#E7E5E4] transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs group-hover:bg-amber-600 transition-colors">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#171717]">
              AI Project Assistant
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-[#666666]">
            <a href="#product" className="hover:text-[#171717] transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-[#171717] transition-colors">How it Works</a>
            <a href="#features" className="hover:text-[#171717] transition-colors">Features</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-[#666666] hover:text-[#171717] px-2 py-1 transition-colors"
            >
              Sign in
            </Link>
            <button
              onClick={handleCtaClick}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="pt-24 pb-20 px-6 max-w-4xl mx-auto text-center space-y-8 select-none">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E7E5E4] bg-[#FFFFFF] text-[11px] font-mono text-[#666666] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>AI-POWERED PROJECT INTELLIGENCE</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.12]">
          Turn project knowledge into <br className="hidden sm:inline" />
          <span className="text-amber-600">actionable engineering work.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base text-[#666666] max-w-2xl mx-auto leading-relaxed">
          Upload your project documents. Let AI understand, analyze, connect, and transform them into requirements, stories, tasks, and project insights.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 bg-[#FFFFFF] hover:bg-[#E7E5E4]/50 border border-[#E7E5E4] text-[#171717] text-xs font-semibold rounded-md transition-colors text-center"
          >
            Explore How It Works
          </a>
        </div>

        {/* Subtle Supporting Info */}
        <div className="pt-8 border-t border-[#E7E5E4]/60 flex flex-wrap justify-center items-center gap-6 text-xs text-[#666666] font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Grounded AI</span>
          </div>
          <span className="text-[#E7E5E4]">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Project-aware intelligence</span>
          </div>
          <span className="text-[#E7E5E4]">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Traceable outputs</span>
          </div>
        </div>
      </section>

      {/* SECTION 3 — PROJECT INTELLIGENCE VISUAL */}
      <section id="product" className="py-16 px-6 max-w-5xl mx-auto">
        <div className="border border-[#E7E5E4] bg-[#FFFFFF] rounded-2xl p-8 shadow-xs space-y-8">
          
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">
                INTELLIGENCE PIPELINE WORKFLOW
              </span>
              <h3 className="text-lg font-bold text-[#171717]">End-to-End Specification Traceability</h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ● Active Workflow
            </span>
          </div>

          {/* Workflow Diagram Components */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative text-xs">
            
            {/* Step 1 */}
            <div className="p-3 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-[#666666] uppercase block">SOURCE</span>
              <div className="font-bold text-[#171717] flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Documents</span>
              </div>
              <span className="text-[10px] text-[#666666] block">PDF, DOCX, TXT</span>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-amber-600 uppercase block">ENGINE</span>
              <div className="font-bold text-amber-700 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Understands</span>
              </div>
              <span className="text-[10px] text-[#666666] block">ChromaDB RAG</span>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-[#666666] uppercase block">MATRIX</span>
              <div className="font-bold text-[#171717] flex items-center justify-center gap-1">
                <span className="font-mono text-amber-600 text-[11px]">REQ</span>
                <span>Requirements</span>
              </div>
              <span className="text-[10px] text-[#666666] block">Functional Specs</span>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-[#666666] uppercase block">AGILE</span>
              <div className="font-bold text-[#171717] flex items-center justify-center gap-1">
                <span className="font-mono text-purple-600 text-[11px]">US</span>
                <span>User Stories</span>
              </div>
              <span className="text-[10px] text-[#666666] block">Criteria Checklists</span>
            </div>

            {/* Step 5 */}
            <div className="p-3 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-[#666666] uppercase block">SPRINT</span>
              <div className="font-bold text-[#171717] flex items-center justify-center gap-1">
                <span className="font-mono text-emerald-600 text-[11px]">TSK</span>
                <span>Tasks</span>
              </div>
              <span className="text-[10px] text-[#666666] block">Kanban Board</span>
            </div>

            {/* Step 6 */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-emerald-600 uppercase block">OUTCOME</span>
              <div className="font-bold text-emerald-700 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery</span>
              </div>
              <span className="text-[10px] text-[#666666] block">Verified Code</span>
            </div>
          </div>

          {/* Branching Conflict Card */}
          <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AI Conflict Detection automatically surface specification contradictions during understanding</span>
            </div>
            <span className="font-mono text-[10px] text-amber-700 border border-amber-300 px-2 py-0.5 rounded">
              Branching Risk Scanner
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 4 — THE PROBLEM */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-[#E7E5E4]">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider block">THE CHALLENGE</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#171717] tracking-tight">
              Your project knowledge is scattered.
            </h2>
          </div>

          {/* Scattered Knowledge Types List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {['Requirements PDFs', 'Architecture documents', 'Product specifications', 'Business rules', 'Meeting notes', 'Scattered chats'].map((item, idx) => (
              <div key={idx} className="p-3 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl text-[#666666] font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-[#666666] leading-relaxed max-w-2xl">
            Important project knowledge often lives across disconnected documents and conversations. This makes requirements harder to understand, contradictions harder to detect, and engineering work harder to trace.
          </p>
        </div>
      </section>

      {/* SECTION 5 — THE SOLUTION */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#E7E5E4]">
        <div className="space-y-10">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-amber-600 uppercase tracking-wider block">THE SOLUTION</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#171717] tracking-tight">
              One intelligence layer for the entire project.
            </h2>
          </div>

          {/* 6 Numbered Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solutionStages.map((stage, idx) => (
              <div
                key={stage.num}
                onMouseEnter={() => setActiveStage(idx)}
                className={`p-5 rounded-2xl border transition-all duration-200 space-y-3 cursor-pointer ${
                  activeStage === idx
                    ? 'bg-[#FFFFFF] border-amber-500/80 shadow-md scale-[1.01]'
                    : 'bg-[#FFFFFF]/60 border-[#E7E5E4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-amber-600">{stage.num}</span>
                  <span className="text-[10px] font-mono uppercase text-[#666666]">{stage.title}</span>
                </div>
                <h4 className="font-bold text-sm text-[#171717]">{stage.subtitle}</h4>
                <p className="text-xs text-[#666666] leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — GROUNDED AI COPILOT */}
      <section id="features" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#E7E5E4]">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-purple-600 uppercase tracking-wider block">GROUNDED RETRIEVAL</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#171717] tracking-tight">
              Ask your project. Get grounded answers.
            </h2>
          </div>

          {/* Product Preview Box */}
          <div className="border border-[#E7E5E4] bg-[#FFFFFF] rounded-2xl p-6 shadow-xs space-y-4 max-w-3xl">
            
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-amber-600 text-white rounded-xl rounded-tr-none px-4 py-2.5 text-xs font-medium max-w-md">
                What are the authentication requirements?
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-3 max-w-xl">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl rounded-tl-none p-4 text-xs text-[#171717] space-y-3 leading-relaxed">
                <p>
                  Authentication requires users to verify their identity before accessing protected project resources. All login endpoints must enforce rate-limiting and return JWT bearer tokens upon successful verification.
                </p>

                {/* Grounded Sources */}
                <div className="pt-2 border-t border-[#E7E5E4] space-y-1">
                  <span className="text-[10px] font-mono text-[#666666] uppercase block">SOURCES</span>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E7E5E4] rounded text-[11px] font-mono text-slate-700">
                    <FileText className="w-3 h-3 text-amber-600" />
                    <span>requirements.pdf</span>
                    <span className="text-[#666666]">· Chunk 12</span>
                    <span className="text-emerald-600 font-bold">· 94% relevance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — TRACEABILITY */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-t border-[#E7E5E4]">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-amber-600 uppercase tracking-wider block">TRACEABILITY LINKAGE</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#171717] tracking-tight">
              From requirement to implementation.
            </h2>
          </div>

          {/* Traceability Flow Cards */}
          <div className="border border-[#E7E5E4] bg-[#FFFFFF] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              
              {/* REQ */}
              <div className="p-4 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold">
                  REQ-014
                </span>
                <h4 className="font-bold text-sm text-[#171717] font-sans">User Authentication</h4>
                <p className="text-[11px] text-[#666666] font-sans">Users must authenticate before accessing workspace endpoints.</p>
              </div>

              {/* US */}
              <div className="p-4 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-2">
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded font-bold">
                    US-021
                  </span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded font-bold">
                    US-022
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#171717] font-sans">User Login & Password Reset</h4>
                <p className="text-[11px] text-[#666666] font-sans">As a user, I want to authenticate via JWT bearer tokens.</p>
              </div>

              {/* TSK */}
              <div className="p-4 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded font-bold">
                  TSK-041
                </span>
                <h4 className="font-bold text-sm text-[#171717] font-sans">Create Authentication API</h4>
                <p className="text-[11px] text-[#666666] font-sans">Implement FastAPI endpoint & JWT verification handlers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — CONFLICT DETECTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-t border-[#E7E5E4]">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-amber-600 uppercase tracking-wider block">CONTRADICTION SCANNER</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#171717] tracking-tight">
              Catch contradictions before they become problems.
            </h2>
          </div>

          {/* Conflict Side-by-Side Box */}
          <div className="border border-amber-200 bg-[#FFFFFF] rounded-2xl p-6 shadow-xs space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-1.5">
                <span className="text-[10px] text-amber-600 font-bold uppercase">requirements.pdf</span>
                <p className="text-[#171717] font-bold">"Use JWT authentication for user sessions."</p>
              </div>

              <div className="p-4 bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl space-y-1.5">
                <span className="text-[10px] text-amber-600 font-bold uppercase">architecture.docx</span>
                <p className="text-[#171717] font-bold">"Use server-side sessions stored in Redis."</p>
              </div>
            </div>

            {/* AI Conflict Alert */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>AI CONFLICT DETECTED</span>
                </div>
                <p className="text-amber-800">These specifications describe different authentication mechanisms.</p>
              </div>

              <button
                onClick={handleCtaClick}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition-colors cursor-pointer text-xs shrink-0"
              >
                Review Conflict
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center border-t border-[#E7E5E4] space-y-8 select-none">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#171717]">
            Your project already contains the knowledge.
          </h2>
          <p className="text-xl text-[#666666]">
            Now make it actionable.
          </p>
        </div>

        <div>
          <button
            onClick={handleCtaClick}
            className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="border-t border-[#E7E5E4] bg-[#FCFCFA] py-12 px-6 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs text-[#666666]">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-[#171717]">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>AI Project Assistant</span>
            </div>
            <p className="text-[11px]">Turn project knowledge into actionable engineering work.</p>
          </div>

          <div className="flex flex-wrap gap-6 font-medium">
            <a href="#product" className="hover:text-[#171717] transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-[#171717] transition-colors">How it Works</a>
            <a href="#features" className="hover:text-[#171717] transition-colors">Features</a>
            <a href="https://github.com/Sathwik797/AI-Project-Assistant.git" target="_blank" rel="noreferrer" className="hover:text-[#171717] transition-colors inline-flex items-center gap-1">
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="font-mono text-[11px] text-[#666666]">
            © 2026 AI Project Assistant
          </div>
        </div>
      </footer>
    </div>
  );
}
