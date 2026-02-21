/**
 * SmartAutoRefresh Component Types
 * 
 * Reusable auto-refresh component with countdown timer
 * Based on RechargeOrderList.vue implementation
 */

export interface SmartAutoRefreshProps {
  /** Whether auto-refresh is enabled */
  modelValue: boolean;
  
  /** Available refresh intervals in seconds */
  intervals?: number[];
  
  /** Default refresh interval in seconds */
  defaultInterval?: number;
  
  /** Callback function to execute on refresh */
  onRefresh: () => void | Promise<void>;
  
  /** Size of the components */
  size?: 'small' | 'medium' | 'large';
  
  /** Custom labels */
  labels?: {
    enabled?: string;
    disabled?: string;
    placeholder?: string;
  };
  
  /** Show success messages when toggling */
  showMessages?: boolean;
  
  /** Pause auto-refresh when user is interacting */
  pauseOnInteraction?: boolean;
  
  /** Custom CSS classes */
  class?: string;
}

export interface SmartAutoRefreshEmits {
  'update:modelValue': [value: boolean];
  'intervalChange': [interval: number];
  'refresh': [];
}

export interface RefreshIntervalOption {
  label: string;
  value: number;
}

export interface SmartAutoRefreshExpose {
  /** Start the auto-refresh timer */
  start: () => void;
  
  /** Stop the auto-refresh timer */
  stop: () => void;
  
  /** Restart with current settings */
  restart: () => void;
  
  /** Get current countdown value */
  getCountdown: () => number;
  
  /** Get current interval */
  getInterval: () => number;
  
  /** Manually trigger refresh */
  triggerRefresh: () => void;
}
