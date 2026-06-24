# Fusion

A unified development environment that combines project management, collaborative code editing, API testing, and infrastructure visualization into one open-source platform.

## Features

- **Project Management** - Tasks, documents, and team collaboration
- **Real-Time Code Editor** - Collaborative editing with Yjs CRDT
- **API Playground** - Test and debug APIs with an intuitive interface
- **Infrastructure Visualization** - Deploy and manage your infrastructure

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Real-Time**: Yjs, Monaco Editor, WebSockets
- **Backend**: tRPC, Prisma, PostgreSQL
- **Infrastructure**: Docker, Kubernetes, Terraform

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL
- Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fusion.git

# Navigate to the project
cd fusion

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start the development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fusion

# Redis
REDIS_URL=redis://localhost:6379

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# OpenAI (optional)
OPENAI_API_KEY=your_key
```

## Project Structure

```
fusion/
├── apps/
│   └── web/                 # Next.js 15 frontend
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── db/                  # Prisma schema and client
│   ├── auth/                # Authentication utilities
│   └── types/               # Shared TypeScript types
├── tooling/
│   ├── eslint/
│   └── typescript/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── k8s/                     # Kubernetes manifests
```

## Development

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm type-check
```

## Deployment

### Docker

```bash
# Build the image
docker build -t fusion -f docker/Dockerfile .

# Run with docker-compose
cd docker
docker-compose up -d
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/deployment.yaml
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

MIT © [Your Name](https://github.com/yourusername)
