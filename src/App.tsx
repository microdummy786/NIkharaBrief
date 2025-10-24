
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { BriefGenerator } from './components/BriefGenerator';
import type { Page, Brief, User } from './types';
import { BriefDisplay } from './components/BriefDisplay';
import { PlaceholderPage } from './components/PlaceholderPage';
import { NAV_ITEMS } from './constants';
import { Logo, MenuIcon } from './components/Icons';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Home');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState<User>({
      id: 'dev-user',
      username: '@alex_creative',
      displayName: 'Alex',
      payment: 'paid',
      role: 'user',
      tokens: 150,
  });

  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserTokens = useCallback((newTokens: number) => {
    setUser(prevUser => ({...prevUser, tokens: newTokens}));
  }, []);

  const handleSetActivePage = (page: Page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Home':
        return (
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <BriefGenerator 
              setCurrentBrief={setCurrentBrief}
              setIsLoading={setIsLoading}
              setError={setError}
              currentUser={user}
              updateTokens={updateUserTokens}
            />
            <BriefDisplay 
              brief={currentBrief} 
              isLoading={isLoading} 
              error={error} 
              currentUser={user}
            />
          </div>
        );
      case 'Brief Gallery':
      case 'Discover':
      case 'Leaderboards':
      case 'Saved Briefs':
        const pageItem = NAV_ITEMS.find(item => item.name === activePage);
        return <PlaceholderPage title={activePage} icon={pageItem?.icon} />;
      default:
        return <PlaceholderPage title="Home" icon={NAV_ITEMS[0].icon} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg-primary font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={handleSetActivePage}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        currentUser={user}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-brand-border sticky top-0 bg-brand-bg-primary/80 backdrop-blur-sm z-30">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-brand-accent-primary" />
            <span className="text-xl font-bold text-brand-text-primary">NikharaBrief</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-md hover:bg-white/10">
            <MenuIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-grow p-4 sm:p-6 md:p-8">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;