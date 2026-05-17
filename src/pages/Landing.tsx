import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutTemplate, ShieldCheck, Database, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-transparent overflow-hidden relative">
      <header className="container relative z-10 mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">Walrus Form</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase tracking-widest text-blue-500 dark:text-blue-400 font-bold ml-2">Mainnet</span>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a href="#features" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
          <a href="#security" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Security</a>
          <Link to="/auth">
            <Button className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 border-none">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="container relative z-10 mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 backdrop-blur-sm">
              Now on Sui Mainnet
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] text-slate-900 dark:text-white">
              Unstoppable Forms,
              <br/>
              <span className="text-slate-400 dark:text-slate-500">Decentralized.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Build beautiful, high-converting forms backed by the Walrus storage network and Seal encryption. Full privacy, zero vendor lock-in.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Link to="/auth">
              <Button size="lg" className="rounded-full h-14 px-8 text-base font-bold shadow-xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 border-none text-white">
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto">
          <FeatureCard 
            icon={<LayoutTemplate />}
            title="Visual Builder"
            description="Premium drag-and-drop editor that feels like your favorite design tools."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Database />}
            title="Walrus Storage"
            description="Your data is decentralized, chunked, and stored permanently on-chain using Walrus."
            delay={0.5}
          />
          <FeatureCard 
            icon={<ShieldCheck />}
            title="Seal Encryption"
            description="End-to-end encryption for sensitive form responses. You own the private keys."
            delay={0.6}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="p-8 rounded-3xl glass-panel border-slate-200 dark:border-white/10 flex flex-col items-start"
    >
      <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
