import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, Menu } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const App = () => {
  let [a, setA] = React.useState(1);
  let [b, setB] = React.useState(2);
  let [activePageName, setActivePageName] = React.useState('page1');
  let [menuOpen, setMenuOpen] = React.useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }
  return (
    <div className='app'>
      {/* Header */}
      <div className='header flex items-center justify-between'>
        <div onClick={toggleMenu}>
          <Menu size={16} />
        </div>
        header
        <div>
          <X size={16} />
        </div>
      </div>
      {/* Pages */}
      <div className='page-container'>
        {activePageName === 'page1' && (
          <div className='page'>
            page1
            <div>react test {a + b}</div>
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
          <div className='drawer-header'>drawer header</div>
          <div className='drawer-content'>
            <div>drawer content</div>
            <div
              onClick={() => {
                setActivePageName('page1');
              }}
            >
              page1
            </div>
            <div
              onClick={() => {
                setActivePageName('page2');
              }}
            >
              page2
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
