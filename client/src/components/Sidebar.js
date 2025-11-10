import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', href: '/', icon: 'home' },
        { name: 'Data Ingestion', href: '/data', icon: 'database' },
        { name: 'API Doc', href: '/api', icon: 'file-alt' },
        { name: 'Eye Disease Classifier', href: '/', icon: 'eye', active: true },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Content Curation', href: '/content', icon: 'chart-bar' },
        { name: 'Analytics', href: '/analytics', icon: 'chart-bar' },
        { name: 'Status', href: '/status', icon: 'cog' },
      ]
    },
    {
      title: 'MORE PAGES',
      items: [
        { name: 'Page 1', href: '/page1', icon: 'file-alt' },
        { name: 'Page 2', href: '/page2', icon: 'file-alt' },
      ]
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <FontAwesomeIcon icon="eye" />
          </div>
          <span>Discoverist.ai</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((section, index) => (
          <div key={index} className="nav-section">
            <div className="nav-title">{section.title}</div>
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                to={item.href}
                className={`nav-item ${
                  (location.pathname === item.href || item.active) ? 'active' : ''
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="nav-item-icon" />
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
