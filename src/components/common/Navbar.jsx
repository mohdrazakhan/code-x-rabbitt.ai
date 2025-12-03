"use client"

import React from 'react';
import Link from 'next/link';
import ButtonHoverMultiple from './CTA-Nav';

const features = [
  { title: 'Tips For Your Code', href: '#' },
  { title: 'Roadmap', href: '#' },
  { title: 'Quiz for your Level', href: '#' },
];

const navOptions = [
  { title: 'Features', dropdown: features },
  { title: 'Contact Us', href: '/contact' },
  { title: 'About Us', href: '/about' },
];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-zinc-900 px-6 py-3 border-b border-zinc-800">
      <div className="flex-shrink-0">
        <Link href="/editor" className='cursor-pointer'>
          <ButtonHoverMultiple />
        </Link>
      </div>

      <ul className="flex space-x-8 text-zinc-200 font-medium">
        {navOptions.map((option) =>
          option.dropdown ? (
            <li key={option.title} className="relative group">
              <button className="inline-flex items-center gap-1 focus:outline-none">
                {option.title}
                <svg
                  className="w-4 h-4 mt-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <ul className="absolute left-0 top-full mt-1 w-48 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                {option.dropdown.map((item) => (
                  <li key={item.title} className="px-4 py-2 hover:bg-zinc-700 transition-colors">
                    <Link href={item.href}>{item.title}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={option.title}>
              <Link href={option.href} className="hover:text-white transition-colors">
                {option.title}
              </Link>
            </li>
          )
        )}
      </ul>

      <div className="text-white font-bold text-xl bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
        CodeX
      </div>
    </nav>
  );
}
