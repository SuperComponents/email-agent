# Cloudflare Chat Widget Integration Guide

## Quick Start

Add the Cloudflare AI Chat Widget to your website in under 2 minutes!

### Step 1: Add the Script

Add this code snippet just before the closing `</body>` tag on your website:

```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'CFWidget', 'https://your-cdn.com/loader.js'));
  
  CFWidget('init', {
    appId: 'your-app-id-here'
  });
</script>
```

### Step 2: That's It!

Your visitors will now see a chat button in the bottom-right corner of your website. Clicking it opens the AI-powered chat interface.

## Configuration Options

Customize the widget behavior during initialization:

```javascript
CFWidget('init', {
  appId: 'your-app-id-here',      // Required: Your unique app ID
  position: 'bottom-right',        // Widget position: 'bottom-right' or 'bottom-left'
  theme: 'light',                  // Color theme: 'light' or 'dark'
  startOpen: false,                // Start with chat open: true or false
  user: {                          // Optional: Pre-identify the user
    id: 'user-123',
    email: 'user@example.com',
    name: 'John Doe'
  }
});
```

## Controlling the Widget

You can programmatically control the widget using these methods:

```javascript
// Open the chat
CFWidget('open');

// Close the chat
CFWidget('close');

// Toggle open/closed state
CFWidget('toggle');

// Completely remove the widget
CFWidget('destroy');

// Re-initialize after destroy
CFWidget('init', { appId: 'your-app-id' });
```

## Examples

### Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Site</h1>
  
  <!-- Your content here -->
  
  <!-- Cloudflare Chat Widget -->
  <script>
    (function(w,d,s,o,f,js,fjs){
      w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
      js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
      js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
    }(window, document, 'script', 'CFWidget', 'https://your-cdn.com/loader.js'));
    
    CFWidget('init', { appId: 'abc123' });
  </script>
</body>
</html>
```

### With User Identification

```html
<script>
  // After your loader script...
  CFWidget('init', {
    appId: 'abc123',
    user: {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.fullName
    }
  });
</script>
```

### Custom Trigger Button

```html
<button onclick="CFWidget('toggle')">
  Need Help?
</button>
```

### Single Page Application (SPA)

```javascript
// In your React/Vue/Angular app
componentDidMount() {
  if (window.CFWidget) {
    CFWidget('init', { appId: 'abc123' });
  }
}

componentWillUnmount() {
  if (window.CFWidget) {
    CFWidget('destroy');
  }
}
```

## What Your Users See

1. **Floating Button**: A small orange chat button appears in the corner
2. **Click to Open**: Clicking the button opens the full chat interface
3. **AI Assistant**: Users can ask questions and get instant AI-powered responses
4. **Tool Confirmations**: When the AI wants to perform actions, users see clear confirmations
5. **Close Anytime**: The X button closes the chat and returns to the floating button

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify your app ID is correct
3. Ensure the script is loaded after the DOM is ready
4. Check for Content Security Policy (CSP) restrictions

### Styling Issues

The widget runs in an isolated iframe, so:
- Your site's CSS won't affect the widget
- The widget's CSS won't affect your site
- Position and theme options are the only styling controls

### Performance

- Initial load: ~2KB (loader.js)
- Full widget: ~410KB (loaded on-demand when opened)
- Cached aggressively after first load

## Need Help?

- Documentation: https://docs.example.com/chat-widget
- Support: support@example.com
- GitHub: https://github.com/example/chat-widget 