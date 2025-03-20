
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full px-8 py-4 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse-subtle" />
          </div>
          <h1 className="text-lg font-medium">PDF Chat Assistant</h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted">
            AI-Powered
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
