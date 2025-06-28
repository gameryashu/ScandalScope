# ScandalScope 🔥

> **AI-powered social media post analyzer that predicts cancel risk before you hit "send"**

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-purple)](https://scandalscope.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

## 🎯 What is ScandalScope?

ScandalScope uses cutting-edge AI to analyze your social media posts and predict their "cancel risk" before you publish. Get roasted by GPT-4, receive professional apology templates, and see how your content ranks on our controversy leaderboard.

### ✨ Key Features

- 🤖 **AI-Powered Analysis** - GPT-4 + Google Perspective API for accurate risk assessment
- 🔥 **Real-time Roasting** - Get savage (but fair) feedback on your takes
- 📊 **Cancel Risk Scoring** - 0-100 scale with detailed category breakdown
- 🏆 **Leaderboard** - See who's living dangerously (anonymized)
- 💼 **Apology Generator** - Professional damage control templates
- 📱 **Mobile-First Design** - Optimized for Gen Z's preferred platform
- 🌙 **Dark Mode** - Because we're not monsters
- 📈 **Analytics Dashboard** - Track your controversy over time

## 🚀 Live Demo

**[Try ScandalScope Now →](https://scandalscope.vercel.app)**

![ScandalScope Demo](./docs/images/demo-screenshot.png)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand with Immer
- **Animations**: Framer Motion
- **AI Services**: OpenAI GPT-4, Google Perspective API
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Google Cloud API key with Perspective API enabled

## 🔧 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/ScandalScope.git
cd ScandalScope
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Add your API keys to `.env`:
```env
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_PERSPECTIVE_API_KEY=your_google_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and start analyzing! 🎉

## 📖 Usage Examples

### Basic Analysis
```typescript
import { analyzeText } from './src/services/analysis';

const result = await analyzeText("Pineapple on pizza is actually good");
console.log(`Cancel Risk: ${result.cancelScore}/100`);
console.log(`Roast: ${result.roast}`);
```

### Custom Configuration
```typescript
const result = await analyzeText("Your controversial take here", {
  roastPersonality: 'savage',
  includeApology: true,
  language: 'en'
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- AnalysisService.test.ts
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── AnalysisInput/  # Text input and analysis trigger
│   ├── AnalysisResult/ # Results display
│   └── Leaderboard/    # Rankings and stats
├── hooks/              # Custom React hooks
├── services/           # Business logic and API calls
│   └── analysis/       # Analysis service and providers
├── store/              # State management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
├── config/             # Configuration management
└── __tests__/          # Test files
```

## 🎨 Design System

ScandalScope uses a Gen Z-focused design language:

- **Colors**: Dark backgrounds with neon accents (purple, pink, green)
- **Typography**: Inter for UI, JetBrains Mono for code
- **Animations**: Subtle micro-interactions and glitch effects
- **Mobile-First**: Responsive design optimized for mobile users

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 🐛 Found a Bug?
[Open an issue](https://github.com/YOUR_USERNAME/ScandalScope/issues/new?template=bug_report.md) with details and steps to reproduce.

### 💡 Feature Request?
[Suggest a feature](https://github.com/YOUR_USERNAME/ScandalScope/issues/new?template=feature_request.md) and let's discuss!

## 📊 Roadmap

- [ ] **Chrome Extension** - Analyze posts before publishing on Twitter/LinkedIn
- [ ] **Post Time Machine** - Analyze old tweets for retroactive cancel risk
- [ ] **Advanced Roast Styles** - HR mode, Disappointed parent, Twitter savage
- [ ] **User Accounts** - Save analysis history and personal stats
- [ ] **API Access** - Public API for developers
- [ ] **Mobile App** - Native iOS/Android apps

## 🔐 Security

Security is a top priority. Please review our [Security Policy](SECURITY.md) for:
- Vulnerability reporting
- Data handling practices
- API key security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4 API
- [Google](https://developers.perspectiveapi.com/) for Perspective API
- [Vercel](https://vercel.com/) for hosting
- Our amazing [contributors](https://github.com/YOUR_USERNAME/ScandalScope/graphs/contributors)

## 📞 Support

- 📧 Email: support@scandalscope.com
- 💬 Discord: [Join our community](https://discord.gg/scandalscope)
- 🐦 Twitter: [@ScandalScope](https://twitter.com/scandalscope)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/ScandalScope&type=Date)](https://star-history.com/#YOUR_USERNAME/ScandalScope&Date)

---

<div align="center">
  <strong>Made with 🔥 by developers who've been canceled before</strong>
  <br>
  <sub>Use responsibly. We're not liable for your bad takes.</sub>
</div>