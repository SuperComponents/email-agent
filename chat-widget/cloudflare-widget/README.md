# Cloudflare AI Chat Widget

This is a React-based chat widget built from the Cloudflare AI Agents starter template. It runs as an embeddable widget that can be integrated into any website.

## Features

- 🤖 AI-powered chat interface
- 🎨 Dark/Light theme support
- 🔧 Tool invocations with human-in-the-loop confirmations
- 💬 Real-time streaming responses
- 🔒 Complete style isolation via iframe
- 📱 Responsive design

## Quick Start

1. Run the demo:
```bash
./run-demo.sh
```

2. Open the demo page: http://localhost:3002/demo.html

## Integration

Add this snippet to your website:

```html
<script>
  !function(w,d,s,u,v){
    w.CloudflareWidgetObject=v;
    w[v]=w[v]||function(){(w[v].q=w[v].q||[]).push(arguments)};
    var js=d.createElement(s), f=d.getElementsByTagName(s)[0];
    js.async=1; js.src=u; f.parentNode.insertBefore(js,f);
  }(window,document,'script','https://your-cdn.com/loader.js','CFWidget');

  CFWidget('init', { 
    appId: 'your-app-id',
    theme: 'dark',
    user: { 
      id: 'user-123', 
      email: 'user@example.com' 
    }
  });
</script>
```

## Architecture

- **Widget Bundle**: React app (~150KB) that runs inside an iframe
- **Loader Script**: Tiny script (~2KB) that creates the iframe
- **Backend API**: Your Cloudflare Worker or any API endpoint

## Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Serve built files
npm run serve
```

## Customization

1. **Styling**: Edit `src/styles.css` and Tailwind config
2. **Components**: Modify React components in `src/components/`
3. **Chat Logic**: Update `src/agents-stub/ai-react.js` to connect to your backend
4. **Tools**: Add custom tools in `src/tools.ts`

## API Integration

The widget expects a POST endpoint at `/api/chat` that accepts:

```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "maxSteps": 5
}
```

And returns a streaming text response.

## Files

- `src/widget-wrapper.tsx` - Widget initialization
- `src/app.tsx` - Main chat interface
- `public/loader.js` - Embedding script
- `public/demo.html` - Demo page 