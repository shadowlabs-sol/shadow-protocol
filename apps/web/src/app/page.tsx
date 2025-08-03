'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Lock, Shield, Zap, Eye, Users, Award, ChevronDown } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black/3 rounded-full blur-4xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-6 md:px-16 md:py-8">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-black rounded-sm" />
            <span className="text-xl font-medium tracking-tight">Shadow</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-8"
          >
            <a href="#features" className="text-sm text-black/60 hover:text-black transition-smooth">Features</a>
            <a href="#how" className="text-sm text-black/60 hover:text-black transition-smooth">How it Works</a>
            <a href="#security" className="text-sm text-black/60 hover:text-black transition-smooth">Security</a>
            <button className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-black/90 transition-smooth">
              Launch App
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-20 md:px-16 md:py-32">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 mb-8 bg-black/5 backdrop-blur-sm rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Zero-Knowledge Auctions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight mb-6">
              Privacy is the new
              <br />
              <span className="font-medium">transparency</span>
            </h1>
            
            <p className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto mb-12">
              Shadow Protocol enables truly private auctions on-chain. 
              No front-running. No manipulation. Just pure market dynamics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-black text-white rounded-full hover:bg-black/90 transition-smooth flex items-center justify-center space-x-2">
                <span>Start Auctioning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
              </button>
              <button className="px-8 py-4 bg-white border border-black/10 rounded-full hover:bg-black/5 transition-smooth">
                Read Whitepaper
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex justify-center mt-20"
          >
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-8 py-20 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Lock,
                title: "Encrypted Bids",
                description: "All bid amounts remain completely encrypted until auction settlement"
              },
              {
                icon: Eye,
                title: "MEV Protection",
                description: "Eliminate front-running and sandwich attacks with private order flow"
              },
              {
                icon: Zap,
                title: "Instant Settlement",
                description: "Atomic execution ensures immediate and secure asset transfers"
              },
              {
                icon: Shield,
                title: "Provably Fair",
                description: "Cryptographic proofs guarantee auction integrity without revealing data"
              },
              {
                icon: Users,
                title: "Batch Auctions",
                description: "Settle multiple auctions atomically for maximum efficiency"
              },
              {
                icon: Award,
                title: "Vickrey Auctions",
                description: "Second-price sealed-bid auctions for true price discovery"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 bg-white border border-black/5 rounded-2xl hover:border-black/10 transition-smooth"
              >
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black/10 transition-smooth">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-black/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative z-10 px-8 py-20 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-light mb-4">How it works</h2>
            <p className="text-lg text-black/60">Simple, secure, seamless</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Auction",
                description: "Set up your auction with encrypted reserve price and parameters"
              },
              {
                step: "02", 
                title: "Submit Bids",
                description: "Bidders submit encrypted bids that remain private until settlement"
              },
              {
                step: "03",
                title: "Secure Settlement",
                description: "MPC nodes determine winner without revealing losing bids"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-6xl font-thin text-black/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-black/60">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-[1px] bg-black/20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-8 py-20 md:px-16 bg-black text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "$0", label: "Total Volume", suffix: "M" },
              { value: "0", label: "Auctions Created" },
              { value: "0", label: "Unique Bidders" },
              { value: "100%", label: "Privacy Guaranteed" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-light mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-20 md:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-light mb-6">
            Ready to auction in the shadows?
          </h2>
          <p className="text-lg text-black/60 mb-8">
            Join the future of private, fair, and secure on-chain auctions.
          </p>
          <button className="group px-8 py-4 bg-black text-white rounded-full hover:bg-black/90 transition-smooth inline-flex items-center space-x-2">
            <span>Launch Application</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 md:px-16 border-t border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded-sm" />
            <span className="text-sm font-medium">Shadow Protocol</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-black/60 hover:text-black transition-smooth">Docs</a>
            <a href="#" className="text-sm text-black/60 hover:text-black transition-smooth">GitHub</a>
            <a href="#" className="text-sm text-black/60 hover:text-black transition-smooth">Twitter</a>
            <a href="#" className="text-sm text-black/60 hover:text-black transition-smooth">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}