export function Header({ onReset }: HeaderProps) {
  const handleClose = () => {
    // Send message to parent window to close the widget
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CLOSE_WIDGET' }, '*');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
          CF
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Cloudflare Assistant
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Powered by Workers AI
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          title="New conversation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          title="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 