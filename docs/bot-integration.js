// Bot Integration for Case Roulette
// Handles communication between MiniApp and Telegram Bot

(function() {
  'use strict';

  // Bot integration functions
  const BotIntegration = {
    
    // Send command to bot via WebApp
    sendCommand: function(command, params = {}) {
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn('Telegram WebApp not available');
        return false;
      }

      try {
        const data = {
          command: command,
          params: params,
          timestamp: Date.now(),
          user_id: this.getCurrentUserId()
        };

        window.Telegram.WebApp.sendData(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending command to bot:', error);
        return false;
      }
    },

    // Get current user ID from Telegram
    getCurrentUserId: function() {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
        return window.Telegram.WebApp.initDataUnsafe.user?.id || null;
      }
      return null;
    },

    // Handle subscription activation via bot
    activateSubscription: function(days, promoCode) {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.error('User ID not available');
        return false;
      }

      return this.sendCommand('galdin', {
        user_id: userId,
        days: days,
        promo_code: promoCode
      });
    },

    // Send message to admin
    sendToAdmin: function(message, promoCode) {
      return this.sendCommand('send_to_admin', {
        message: message,
        promo_code: promoCode
      });
    },

    // Notify about promo usage
    notifyPromoUsage: function(promoCode, type, value) {
      return this.sendCommand('promo_used', {
        promo_code: promoCode,
        type: type,
        value: value,
        user_id: this.getCurrentUserId()
      });
    },

    // Open direct chat with admin
    openAdminChat: function(message) {
      try {
        const encodedMessage = encodeURIComponent(message);
        const adminUsername = 'warpscythe';
        const url = `https://t.me/${adminUsername}?text=${encodedMessage}`;
        
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.openTelegramLink(url);
        } else {
          window.open(url, '_blank');
        }
        
        return true;
      } catch (error) {
        console.error('Error opening admin chat:', error);
        return false;
      }
    },

    // Initialize bot integration
    init: function() {
      console.log('🤖 Bot integration initialized');
      
      // Listen for messages from bot
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
          console.log('Main button clicked');
        });

        window.Telegram.WebApp.onEvent('backButtonClicked', () => {
          console.log('Back button clicked');
          window.history.back();
        });
      }
    }
  };

  // Make BotIntegration globally available
  window.BotIntegration = BotIntegration;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BotIntegration.init());
  } else {
    BotIntegration.init();
  }

})();
