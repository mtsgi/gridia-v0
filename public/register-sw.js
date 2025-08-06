// Service Worker登録スクリプト
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // 更新チェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新しいバージョンが利用可能
                if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// オフライン/オンライン状態の監視
window.addEventListener('online', () => {
  console.log('オンラインになりました');
  // オンライン復帰時の処理
});

window.addEventListener('offline', () => {
  console.log('オフラインになりました');
  // オフライン時の処理
});
