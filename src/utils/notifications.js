export function ensureNotificationContainer() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('notification-container')) {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
}

export function showNotification(message, type = 'info', duration = 2500) {
  ensureNotificationContainer();
  const container = document.getElementById('notification-container');
  if (!container) return;

  // Remove all existing notifications instantly
  Array.from(container.children).forEach(n => {
    if (n.parentNode) n.parentNode.removeChild(n);
  });

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
      <span class="notification-message">${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;

  container.appendChild(notification);

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
  notification.classList.add('slide-out');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}