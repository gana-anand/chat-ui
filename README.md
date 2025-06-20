# AutoGen Chat UI

A modern, AI-powered chat interface built with Next.js that integrates with AutoGen Core and FastAPI backends. Features real-time streaming, artifact management, chart rendering, and session persistence.

![AutoGen Chat UI](https://via.placeholder.com/800x400/1e293b/ffffff?text=AutoGen+Chat+UI)

## ✨ Features

- 🤖 **AI Agent Integration** - Seamless integration with AutoGen Core and FastAPI
- 💬 **Real-time Streaming** - Live message streaming with smooth animations
- 📊 **Artifact Management** - Code blocks, charts, and diagrams in a dedicated panel
- 📈 **Chart Rendering** - Interactive charts with Recharts integration
- 🎨 **Mermaid Diagrams** - Support for flowcharts and diagrams
- 🔐 **Azure SSO Authentication** - Environment-based auth with NextAuth.js
- 💾 **Session Persistence** - Chat history saved locally
- 🎯 **Responsive Design** - Works on desktop and mobile
- 🌙 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Python backend with AutoGen Core + FastAPI (optional)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd autogen-chat-ui
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Environment Setup**
   
   Copy the example environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   
   Update the environment variables:
   \`\`\`env
   # Backend Configuration
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8501
   BACKEND_URL=http://localhost:8501
   
   # Authentication Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NODE_ENV=development
   
   # Azure AD (Production Only)
   AUTH_AZURE_AD_CLIENT_ID=your-azure-client-id
   AUTH_AZURE_AD_CLIENT_SECRET=your-azure-client-secret
   AUTH_AZURE_AD_TENANT_ID=your-azure-tenant-id
   
   # For production, change to your actual backend URL:
   # NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
   # BACKEND_URL=https://your-backend-domain.com
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

\`\`\`
autogen-chat-ui/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js API routes
│   │   ├── chat/          # Chat endpoint
│   │   └── test-backend/  # Backend health check
│   ├── auth/              # Auth pages
│   │   ├── signin/        # Custom signin page
│   │   └── error/         # Auth error page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/            # React components
│   ├── auth/             # Auth components
│   │   ├── session-provider.tsx
│   │   ├── sign-in-button.tsx
│   │   ├── sign-out-button.tsx
│   │   └── user-menu.tsx
│   ├── ui/               # shadcn/ui components
│   ├── artifact-window.tsx
│   ├── chat-interface.tsx
│   ├── chart-renderer.tsx
│   ├── message-bubble.tsx
│   ├── message-list.tsx
│   └── sidebar.tsx
├── lib/                  # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── artifact-detector.ts
│   ├── chat-storage.ts
│   └── utils.ts
├── types/               # TypeScript definitions
│   └── next-auth.d.ts   # Auth type extensions
├── middleware.ts        # Route protection
├── public/              # Static assets
├── .env.local          # Environment variables
├── package.json        # Dependencies
├── tailwind.config.ts  # Tailwind configuration
└── README.md          # This file
\`\`\`

## 🔧 Configuration

### Backend Integration

The app expects a FastAPI backend with the following endpoints:

- \`GET /health\` - Health check endpoint
- \`POST /api/chat\` - Chat streaming endpoint

**Expected chat request format:**
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how can you help me?"
    }
  ],
  "session_id": "unique-session-id"
}
\`\`\`

**Expected streaming response format:**
\`\`\`
data: {"choices": [{"delta": {"content": "Hello! I can help you with..."}}]}

data: {"choices": [{"delta": {"content": " various tasks."}}]}

data: [DONE]
\`\`\`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`NEXT_PUBLIC_BACKEND_URL\` | Public backend URL (client-side) | \`http://localhost:8501\` |
| \`BACKEND_URL\` | Backend URL (server-side) | \`http://localhost:8501\` |
| \`NEXTAUTH_URL\` | Your application URL | \`http://localhost:3000\` |
| \`NEXTAUTH_SECRET\` | Secret key for JWT encryption | Required |
| \`NODE_ENV\` | Environment mode | \`development\` |
| \`AUTH_AZURE_AD_CLIENT_ID\` | Azure App Registration Client ID | Production only |
| \`AUTH_AZURE_AD_CLIENT_SECRET\` | Azure App Registration Client Secret | Production only |
| \`AUTH_AZURE_AD_TENANT_ID\` | Azure Tenant ID | Production only |

## 🔐 Authentication

This application includes Azure Entra ID SSO integration with environment-based configuration:

### Development Mode
- **SSO is disabled** for easier development
- Users can bypass authentication with "Continue as Developer" button
- No Azure configuration required

### Production Mode
- **Full Azure Entra ID authentication** flow
- Real user sessions from Azure AD
- Requires Azure App Registration setup

### Azure App Registration Setup (Production)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration** and configure:
   - **Name**: Your application name
   - **Redirect URI**: \`https://yourdomain.com/api/auth/callback/azure-ad\`
4. Copy the **Application (client) ID**
5. Create a **client secret** in **Certificates & secrets**
6. Add API permissions:
   - Microsoft Graph > Delegated > User.Read
   - Microsoft Graph > Delegated > profile, email, openid

## 🎨 Customization

### Styling

The project uses Tailwind CSS with a custom color scheme. Modify \`tailwind.config.ts\` to customize:

\`\`\`typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Customize your color palette
      primary: "hsl(240 5.9% 10%)",
      secondary: "hsl(240 4.8% 95.9%)",
      // ... more colors
    }
  }
}
\`\`\`

### Adding New Artifact Types

To support new artifact types, modify \`lib/artifact-detector.ts\`:

\`\`\`typescript
function getArtifactType(language: string): ArtifactContent["type"] {
  // Add your custom language mappings
  if (language === "your-custom-type") return "custom"
  // ... existing logic
}
\`\`\`

## 📊 Artifact System

The app automatically detects and displays various types of content:

### Supported Artifact Types

- **Code Blocks** - Python, JavaScript, TypeScript, etc.
- **Charts** - JSON-based chart configurations
- **Diagrams** - Mermaid flowcharts and diagrams
- **Data** - JSON, CSV, XML, YAML files

### Chart Format

Charts should be provided as JSON with this structure:

\`\`\`json
{
  "chartType": "bar|line|area|pie",
  "data": [
    {"name": "A", "value": 100},
    {"name": "B", "value": 200}
  ],
  "config": {
    "xAxis": {"dataKey": "name"},
    "series": [{"dataKey": "value", "fill": "#8884d8"}]
  }
}
\`\`\`

## 🧪 Testing

### Backend Connection Test

Use the built-in debug panel to test your backend connection:

1. Navigate to your app
2. The debug panel will show connection status
3. Check browser console for detailed logs

### Manual Testing

\`\`\`bash
# Test backend health
curl http://localhost:8501/health

# Test chat endpoint
curl -X POST http://localhost:8501/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Hello"}], "session_id": "test"}'
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Environment Variables in Vercel**
   \`\`\`
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.com
   BACKEND_URL=https://your-backend.com
   \`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

\`\`\`bash
docker build -t autogen-chat-ui .
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL=http://your-backend:8501 autogen-chat-ui
\`\`\`

## 🛠️ Development

### Available Scripts

\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
\`\`\`

### Adding New Components

1. Create component in \`components/\`
2. Export from component file
3. Import and use in your pages

### Debugging

- Check browser console for client-side logs
- Check terminal for server-side logs
- Use the built-in debug panel for backend connectivity

## 📝 API Reference

### Chat API (\`/api/chat\`)

**POST** \`/api/chat\`

Request body:
\`\`\`typescript
{
  messages: Array<{
    role: "user" | "assistant"
    content: string
  }>
  session_id: string
}
\`\`\`

Response: Server-Sent Events stream

### Test Backend API (\`/api/test-backend\`)

**GET** \`/api/test-backend\`

Returns backend connection status and health information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: This README and inline code comments

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Chart library
- [Mermaid](https://mermaid.js.org/) - Diagram rendering
- [AutoGen](https://github.com/microsoft/autogen) - AI agent framework

---

**Happy coding!** 🚀
\`\`\`

\`\`\`

I've created a comprehensive README that covers:

## 📋 **What's Included:**

### 🚀 **Quick Start Section**
- Prerequisites and installation steps
- Environment setup
- Development server startup

### 🏗️ **Project Structure**
- Clear directory layout
- Component organization
- File descriptions

### 🔧 **Configuration Guide**
- Backend integration requirements
- Environment variables
- API endpoint specifications

### 🎨 **Customization Options**
- Styling with Tailwind CSS
- Adding new artifact types
- Color scheme modifications

### 📊 **Artifact System Documentation**
- Supported types (code, charts, diagrams)
- Chart JSON format specification
- Examples and usage

### 🧪 **Testing Instructions**
- Backend connection testing
- Debug panel usage
- Manual API testing with curl

### 🚀 **Deployment Options**
- Vercel deployment (recommended)
- Docker containerization
- Environment variable setup

### 🛠️ **Development Guide**
- Available npm scripts
- Adding new components
- Debugging tips

### 📝 **API Reference**
- Complete endpoint documentation
- Request/response formats
- TypeScript interfaces

This README provides everything needed for:
- **New developers** to get started quickly
- **Contributors** to understand the codebase
- **Deployers** to set up production environments
- **Users** to configure and customize the app
