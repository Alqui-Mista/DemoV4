import React, { memo, useCallback } from 'react';
import { useVapi } from '../hooks/useVapi';
import type { VapiConfig } from '../types/vapi';
import VapiIcon from './VapiIcon';
import './VapiChatButton.css';

interface VapiChatButtonProps {
  config: VapiConfig;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'floating' | 'center';
}

export const VapiChatButton: React.FC<VapiChatButtonProps> = memo(({
  config,
  className = '',
  size = 'large',
  variant = 'center'
}) => {
  const {
    isSessionActive,
    isLoading,
    toggleCall
  } = useVapi(config);

  const getButtonClass = useCallback(() => {
    const baseClass = 'vapi-chat-button';
    const sizeClass = `vapi-chat-button--${size}`;
    const variantClass = `vapi-chat-button--${variant}`;
    const statusClass = isSessionActive 
      ? 'vapi-chat-button--active' 
      : isLoading 
        ? 'vapi-chat-button--loading'
        : 'vapi-chat-button--inactive';
    
    return `${baseClass} ${sizeClass} ${variantClass} ${statusClass} ${className}`;
  }, [size, variant, isSessionActive, isLoading, className]);

  return (
    <div className="vapi-button-container">
      <button
        onClick={toggleCall}
        disabled={isLoading}
        className={getButtonClass()}
        aria-label={isSessionActive ? 'Terminar llamada' : 'Iniciar llamada'}
      >
        <VapiIcon />
      </button>
    </div>
  );
});

VapiChatButton.displayName = 'VapiChatButton';
