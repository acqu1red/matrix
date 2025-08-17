import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { telegramManager } from '@/lib/telegram';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Crown, Check, Star, Zap } from 'lucide-react';

const Paywall = () => {
  const { setCurrentView, setError } = useAppStore();
  const [isChecking, setIsChecking] = useState(false);

  const handleBack = () => {
    setCurrentView('map');
  };

  const handlePayment = (plan: 'week' | 'month') => {
    // Open external payment page
    const paymentUrl = 'https://acqu1red.github.io/formulaprivate/payment.html';
    telegramManager.openLink(paymentUrl, { try_instant_view: false });
  };

  const handleCheckPayment = async () => {
    setIsChecking(true);
    try {
      const response = await apiClient.checkSubscription();
      if (response.success && response.data?.isSubscribed) {
        // Show success and navigate to channel
        if (response.data.inviteLink) {
          telegramManager.openLink(response.data.inviteLink);
        }
      } else {
        setError('Платёж ещё не подтверждён. Попробуйте позже.');
      }
    } catch (error) {
      setError('Ошибка проверки платежа');
    } finally {
      setIsChecking(false);
    }
  };

  const plans = [
    {
      id: 'week',
      name: '7 дней',
      price: '299 ₽',
      originalPrice: '599 ₽',
      popular: false,
      features: [
        'Доступ ко всем книгам',
        'Приватный канал',
        'Новые главы каждую неделю',
        'Поддержка 24/7',
      ],
    },
    {
      id: 'month',
      name: '30 дней',
      price: '999 ₽',
      originalPrice: '1999 ₽',
      popular: true,
      features: [
        'Доступ ко всем книгам',
        'Приватный канал',
        'Новые главы каждую неделю',
        'Поддержка 24/7',
        'Эксклюзивные материалы',
        'Приоритетная поддержка',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-0 p-4">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={handleBack}
          className="glass rounded-2xl p-3 shadow-elev-1"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <h1 className="text-xl font-heading font-semibold text-white">
          Премиум доступ
        </h1>
        
        <div className="w-11" />
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-glow-1 to-glow-2 rounded-3xl flex items-center justify-center">
          <Crown className="w-10 h-10 text-bg-0" />
        </div>
        
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">
          Откройте полный доступ
        </h2>
        
        <p className="text-white/80">
          Получите доступ ко всем книгам и эксклюзивным материалам
        </p>
      </motion.div>

      {/* Plans */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-6"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`card-glass relative ${plan.popular ? 'ring-2 ring-accent' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent text-bg-0 px-3 py-1 rounded-full text-xs font-semibold">
                  Рекомендуем
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-heading font-semibold text-white">
                  {plan.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-glow-1">
                    {plan.price}
                  </span>
                  <span className="text-white/60 line-through text-sm">
                    {plan.originalPrice}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-glow-2 text-sm">Экономия</div>
                <div className="text-accent font-semibold">
                  {Math.round((parseInt(plan.originalPrice) - parseInt(plan.price)) / parseInt(plan.originalPrice) * 100)}%
                </div>
              </div>
            </div>
            
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-glow-1 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handlePayment(plan.id as 'week' | 'month')}
              className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-r from-accent to-glow-1 text-bg-0 shadow-elev-2'
                  : 'bg-gradient-to-r from-glow-1 to-glow-2 text-bg-0 shadow-elev-1'
              } hover:shadow-elev-3 active:scale-95`}
            >
              Выбрать план
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Check Payment Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleCheckPayment}
          disabled={isChecking}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          <span>{isChecking ? 'Проверяем...' : 'Я оплатил(а)'}</span>
        </button>
      </motion.div>

      {/* Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6"
      >
        <p className="text-white/60 text-sm">
          💯 Гарантия возврата в течение 7 дней
        </p>
      </motion.div>
    </div>
  );
};

export default Paywall;
