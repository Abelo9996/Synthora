import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Rocket, Brain, FileCode, BookOpen } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import './index.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Rocket className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Synthora
            </span>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              AI App Builder
            </span>
          </div>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            <Link
              to="/chat"
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/chat')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Build App
            </Link>
            <a
              href="https://github.com/synthora/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Build Intelligent Apps
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Through Conversation
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Synthora is an AI-native app builder that generates production-ready full-stack applications
            with integrated machine learning capabilities. Just describe what you want to build.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/chat"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Building
            </Link>
            <a
              href="https://github.com/synthora"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-gray-200"
            >
              <FileCode className="w-5 h-5 mr-2" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Natural Language
            </h3>
            <p className="text-gray-600">
              Describe your app in plain English. No coding required to get started.
              Our AI understands your requirements and generates the perfect architecture.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Full-Stack Generation
            </h3>
            <p className="text-gray-600">
              Get complete React + FastAPI applications with database models, REST APIs,
              UI components, and Docker deployment - all production-ready.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Integrated ML
            </h3>
            <p className="text-gray-600">
              Add machine learning capabilities with zero MLOps. Choose from templates
              like churn prediction, recommendations, and anomaly detection.
            </p>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            What You Can Build
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">CRM with Churn Prediction</h4>
              <p className="text-gray-600 text-sm mb-3">
                "Create a CRM with client tracking and deal pipeline. Add churn prediction to identify at-risk customers."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Client Management</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">ML Prediction</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Automation</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">E-commerce with Recommendations</h4>
              <p className="text-gray-600 text-sm mb-3">
                "Build an online store with product catalog and cart. Add smart recommendations based on browsing history."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Products</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Recommendations</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Payments</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">Task Manager with AI Priority</h4>
              <p className="text-gray-600 text-sm mb-3">
                "Create a project management tool with tasks and teams. Predict task priority and completion time automatically."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Projects</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">AI Prediction</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Analytics</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">Support Ticketing with Auto-Triage</h4>
              <p className="text-gray-600 text-sm mb-3">
                "Build a support ticket system. Automatically classify priority and route urgent issues to senior agents."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Tickets</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Auto-Priority</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Routing</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Build Something Amazing?
          </h2>
          <Link
            to="/chat"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Start Building Now
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50">
      <ChatInterface />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
