import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const codeGenerationQueue = new Queue("codeGeneration", { connection });
export const exportQueue = new Queue("exports", { connection });
export const aiAnalysisQueue = new Queue("aiAnalysis", { connection });

interface CodeGenerationJobData {
  code: string;
  instruction: string;
  userId: string;
}

interface ExportJobData {
  projectId: string;
  format: "pdf" | "markdown" | "json";
  userId: string;
}

interface AIAnalysisJobData {
  projectId: string;
  userId: string;
}

export const codeGenerationWorker = new Worker(
  "codeGeneration",
  async (job: Job<CodeGenerationJobData>) => {
    const { code, instruction } = job.data;
    
    await job.updateProgress(50);
    
    const result = await generateCodeSuggestion(code, instruction);
    
    await job.updateProgress(100);
    
    return { result };
  },
  { connection }
);

export const exportWorker = new Worker(
  "exports",
  async (job: Job<ExportJobData>) => {
    const { projectId, format } = job.data;
    
    await job.updateProgress(50);
    
    const result = await generateExport(projectId, format);
    
    await job.updateProgress(100);
    
    return { result };
  },
  { connection }
);

export const aiAnalysisWorker = new Worker(
  "aiAnalysis",
  async (job: Job<AIAnalysisJobData>) => {
    const { projectId } = job.data;
    
    await job.updateProgress(50);
    
    const result = await analyzeProject(projectId);
    
    await job.updateProgress(100);
    
    return { result };
  },
  { connection }
);

async function generateCodeSuggestion(code: string, instruction: string): Promise<string> {
  return `// AI suggestion for: ${instruction}\n// Original code length: ${code.length}\n\n${code}`;
}

async function generateExport(projectId: string, format: string): Promise<string> {
  return `Export for project ${projectId} in ${format} format`;
}

async function analyzeProject(projectId: string): Promise<{ suggestions: string[] }> {
  return {
    suggestions: [
      "Consider adding error handling",
      "Add unit tests for critical functions",
      "Optimize database queries",
    ],
  };
}

export { connection };
