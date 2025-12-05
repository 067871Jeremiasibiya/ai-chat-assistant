# AI Chat Assistant

A modern, beautiful AI chat interface built with React, TypeScript, and Tailwind CSS.

![AI Chat Assistant](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop)

## Features

- Beautiful, modern UI with gradient design
- Real-time chat interface with typing indicators
- Markdown support for formatted responses
- Smooth animations with Framer Motion
- Responsive design for all devices
- Dark/Light message bubbles
- Chat history management

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Markdown** - Message formatting
- **Vite** - Build tool

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3001 in your browser

## Connecting to OpenAI API

To use real AI responses, update the `getAIResponse` function in `src/App.tsx`:

```typescript
const getAIResponse = async (message: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

## Author

**Jeremia Sibiya** - AI Engineer & React Developer

- GitHub: [@067871Jeremiasibiya](https://github.com/067871Jeremiasibiya)
- LinkedIn: [Jeremia Sibiya](https://www.linkedin.com/in/jeremia-ostin-sibiya-278ba6359/)

## License

MIT License
