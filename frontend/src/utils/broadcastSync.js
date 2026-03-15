// Утиліта для синхронізації даних між вкладками браузера
// Використовує BroadcastChannel API для комунікації між вкладками

class BroadcastSync {
  constructor() {
    // Перевіряємо підтримку BroadcastChannel API
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('resource-center-sync');
      this.listeners = new Map();
      
      // Слухаємо повідомлення з інших вкладок
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        
        // Викликаємо всі зареєстровані слухачі для цього типу події
        if (this.listeners.has(type)) {
          this.listeners.get(type).forEach(callback => callback(data));
        }
      };
    } else {
      console.warn('BroadcastChannel API не підтримується в цьому браузері');
    }
  }

  // Відправити повідомлення в інші вкладки
  broadcast(type, data) {
    if (this.channel) {
      this.channel.postMessage({ type, data });
    }
  }

  // Підписатися на події певного типу
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    // Повертаємо функцію для відписки
    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Закрити канал (при розмонтуванні додатку)
  close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

// Створюємо єдиний екземпляр для всього додатку
const broadcastSync = new BroadcastSync();

// Події для синхронізації
export const SYNC_EVENTS = {
  RESOURCE_CREATED: 'resource:created',
  RESOURCE_UPDATED: 'resource:updated',
  RESOURCE_DELETED: 'resource:deleted',
  RESOURCE_APPROVED: 'resource:approved',
  RESOURCE_REJECTED: 'resource:rejected',
  USER_UPDATED: 'user:updated',
  STATS_UPDATED: 'stats:updated'
};

export default broadcastSync;
