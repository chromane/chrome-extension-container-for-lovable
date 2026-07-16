import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, Menu, CircleFadingArrowUpIcon, Home, Settings } from 'lucide-react';
import { Button } from '@src/components/ui/button';
import logo_svg from '@shared/slots/logo-main.svg?raw';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let number_of_renders = 0;

const App = () => {
  number_of_renders++;
  let [a, setA] = React.useState(1);
  let [b, setB] = React.useState(2);
  let [activePageName, setActivePageName] = React.useState('page1');
  let [menuOpen, setMenuOpen] = React.useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function handle_drawer_item_click(pageName: string) {
    return () => {
      setActivePageName(pageName);
      setMenuOpen(false);
    };
  }
  return (
    <div className='app'>
      {/* Header */}
      <div className='header flex items-center justify-between'>
        <Button variant='outline' size='icon' onClick={toggleMenu}>
          <Menu size={16} />
        </Button>
        header{number_of_renders}
        <Button variant='outline' size='icon'>
          <X size={16} />
        </Button>
      </div>
      {/* Pages */}
      <div className='page-container'>
        {activePageName === 'page1' && (
          <div className='page'>
            page1
            <div>react test {a + b}</div>
            <button onClick={() => setA(a + 0)}>+0</button>
            <button onClick={() => setA(a + 1)}>+1</button>
            <button onClick={() => setB(b + 1)}>+1</button>
            <button onClick={() => setActivePageName('page2')}>go to page2</button>
          </div>
        )}
        {activePageName === 'page2' && (
          <div className='page'>
            page2
            <div>react test {a + b}</div>
            <button onClick={() => setA(a + 2)}>+2</button>
            <button onClick={() => setB(b + 2)}>+2</button>
            <button onClick={() => setActivePageName('page1')}>go to page1</button>
          </div>
        )}
      </div>
      {/* Drawer */}
      <div className={cn('drawer', { 'drawer-open': menuOpen })} onClick={() => setMenuOpen(false)}>
        <div className='drawer-body'>
          <div className='drawer-header'>
            <div className='svg'>
              <div dangerouslySetInnerHTML={{ __html: logo_svg }} />
            </div>
          </div>
          <div className='drawer-content'>
            <div className='drawer-content-items'>
              <div className={cn('drawer-content-item', { active: activePageName === 'page1' })} onClick={handle_drawer_item_click('page1')}>
                <Home size={16} />
                <span>Page 1</span>
              </div>
              <div className={cn('drawer-content-item', { active: activePageName === 'page2' })} onClick={handle_drawer_item_click('page2')}>
                <Home size={16} />
                <span>Page 2</span>
              </div>
              <div className={cn('drawer-content-item', { active: activePageName === 'settings' })} onClick={handle_drawer_item_click('settings')}>
                <Settings size={16} />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toasts */}
      {/* Dialogs */}
      {/* Blocking overlay */}
    </div>
  );
};

export default App;
