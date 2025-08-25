import { useState, useCallback, useEffect } from 'react';
import { isRateLimitError, getRetryAfterTime } from '../utils/api';

export const useRateLimit = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  // Handle rate limit error
  const handleRateLimitError = useCallback((error) => {
    if (isRateLimitError(error)) {
      const retryAfterTime = getRetryAfterTime(error);
      setIsRateLimited(true);
      setRetryAfter(retryAfterTime);
      
      if (retryAfterTime) {
        setRateLimitCountdown(retryAfterTime);
      }
      
      return true; // Indicates this was a rate limit error
    }
    return false; // Not a rate limit error
  }, []);

  // Reset rate limit state
  const resetRateLimit = useCallback(() => {
    setIsRateLimited(false);
    setRetryAfter(null);
    setRateLimitCountdown(0);
  }, []);

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            setRetryAfter(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [rateLimitCountdown]);

  // Format countdown for display
  const formatCountdown = useCallback(() => {
    if (rateLimitCountdown <= 0) return null;
    
    const minutes = Math.floor(rateLimitCountdown / 60);
    const seconds = rateLimitCountdown % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds} ثانیه`;
  }, [rateLimitCountdown]);

  // Check if we should disable actions due to rate limiting
  const shouldDisableActions = useCallback(() => {
    return isRateLimited && rateLimitCountdown > 0;
  }, [isRateLimited, rateLimitCountdown]);

  return {
    isRateLimited,
    retryAfter,
    rateLimitCountdown,
    formatCountdown,
    shouldDisableActions,
    handleRateLimitError,
    resetRateLimit
  };
};
