import React from 'react';
import { motion } from 'framer-motion';
import { PermissionGuard } from './PermissionGuard';

function tabClass(isActive) {
  return [
    'relative px-3.5 py-1 text-xs rounded-2xl font-bold tracking-tight whitespace-nowrap z-10 transition-colors duration-200 cursor-pointer select-none',
    isActive
      ? 'text-white'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5',
  ].join(' ');
}

export function PageTabs({
  activeTab = 'list',
  onTabChange,
  onChange,
  isEditing = false,
  listLabel = 'All',
  addLabel = 'Add',
  editLabel = 'Edit',
  extraTabs = [],
  tabs,
  layoutId = 'page-tabs-active-pill',
  className = '',
}) {
  const handleTab = onTabChange || onChange || (() => {});

  // Handle compatibility if caller passed legacy tabs array
  const effectiveListLabel = tabs?.[0]?.label || listLabel;
  const effectiveAddLabel = tabs?.[1]?.label || addLabel;
  const effectiveAddId = tabs?.[1]?.id || 'add';
  const effectiveExtraTabs = extraTabs.length > 0 ? extraTabs : (tabs?.slice(2) || []);

  const isListActive = (activeTab === 'list' || activeTab === 'all') && !isEditing;
  const isAddActive = activeTab === 'add' || activeTab === 'form' || (isEditing && activeTab !== 'list' && activeTab !== 'all');

  return (
    <div className={`common-surface inline-flex items-center gap-0.5 p-1 w-max relative ${className}`}>
      <button
        type="button"
        onClick={() => handleTab('list')}
        className={tabClass(isListActive)}
      >
        {isListActive && (
          <motion.div
            layoutId={layoutId}
            className="absolute inset-0 rounded-2xl z-[-1] bg-gradient-primary shadow-primary"
            style={{
              background: 'var(--gradient-primary, var(--app-primary))',
              boxShadow: 'var(--shadow-primary)'
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10">{effectiveListLabel}</span>
      </button>

      <PermissionGuard action={isEditing ? "edit" : "add"}>
        <button
          type="button"
          onClick={() => handleTab(effectiveAddId === 'form' ? 'form' : 'add')}
          className={tabClass(isAddActive)}
        >
          {isAddActive && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-2xl z-[-1] bg-gradient-primary shadow-primary"
              style={{
                background: 'var(--gradient-primary, var(--app-primary))',
                boxShadow: 'var(--shadow-primary)'
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{isEditing ? editLabel : effectiveAddLabel}</span>
        </button>
      </PermissionGuard>

      {effectiveExtraTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTab(tab.id)}
            className={tabClass(isActive)}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-2xl z-[-1] bg-gradient-primary shadow-primary"
                style={{
                  background: 'var(--gradient-primary, var(--app-primary))',
                  boxShadow: 'var(--shadow-primary)'
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default PageTabs;
