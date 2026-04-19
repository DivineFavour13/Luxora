export function ensureNotificationContainer() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('notification-container')) {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
}

export function showNotification(message, type = 'info', duration = 5000) {
  ensureNotificationContainer();
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  const icon = icons[type] || icons.info;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="${icon}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;

  container.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 50);

  const autoRemove = setTimeout(() => removeNotification(notification), duration);
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoRemove);
      removeNotification(notification);
    });
  }
}

function removeNotification(notification) {
  notification.classList.add('hide');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}
