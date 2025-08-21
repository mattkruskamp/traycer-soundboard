import React from "react";
import { Soundboard } from "./components";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex flex-col">
      <header className="w-full py-6 px-4 flex flex-col items-center bg-white dark:bg-gray-800 shadow">
        <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight">
          Soundboard App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 text-center max-w-2xl">
          Welcome to your React + TypeScript + Vite + Tailwind CSS soundboard
          project!
        </p>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
      </header>
      <main
        id="main"
        className="flex-1 w-full flex flex-col items-center justify-start px-2 py-4"
      >
        <Soundboard />
      </main>
      <footer className="w-full py-4 px-4 text-center text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900">
        &copy; {new Date().getFullYear()} Soundboard App. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
