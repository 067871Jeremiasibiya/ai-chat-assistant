#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DATA_FILE = resolve(process.cwd(), 'job-copilot-data/applications.json');

const profile = {
  name: 'Your Name',
  headline: 'Junior Frontend / Backend Developer',
  summary:
    'Entry-level developer building responsive React interfaces and Node.js APIs, with strong habits around documentation, testing, and shipping useful automation.',
  skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'REST APIs', 'Git', 'SQL basics'],
  projects: [
    {
      name: 'Job Search Copilot',
      impact: 'Built a dashboard and CLI that tailor applications, track job leads, and generate resume starter content.',
    },
    {
      name: 'AI Chat Assistant',
      impact: 'Built a responsive React chat interface with markdown rendering, loading states, and reusable component patterns.',
    },
  ],
};

const ensureDataFile = () => {
  mkdirSync(dirname(DATA_FILE), { recursive: true });

  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

const readApplications = () => {
  ensureDataFile();
  return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
};

const writeApplications = (applications) => {
  ensureDataFile();
  writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2));
};

const createResume = () => {
  const markdown = `# ${profile.name}

${profile.headline}

## Summary
${profile.summary}

## Skills
${profile.skills.join(' | ')}

## Projects
${profile.projects.map((project) => `- **${project.name}:** ${project.impact}`).join('\n')}

## Starter bullet bank
- Built responsive UI screens with React, TypeScript, and Tailwind CSS.
- Created API-ready workflows with clean state handling and validation.
- Used Git branches, builds, and local testing to ship changes reliably.
`;

  writeFileSync(resolve(process.cwd(), 'junior-dev-resume-starter.md'), markdown);
  console.log('Created junior-dev-resume-starter.md');
};

const addApplication = ([company, role, source = 'Manual lead']) => {
  if (!company || !role) {
    console.error('Usage: npm run job -- add "Company" "Role" ["Source"]');
    process.exitCode = 1;
    return;
  }

  const applications = readApplications();
  applications.push({
    id: Date.now().toString(),
    company,
    role,
    source,
    status: 'To apply',
    nextStep: 'Tailor resume, write a focused cover note, then apply.',
    createdAt: new Date().toISOString(),
  });
  writeApplications(applications);
  console.log(`Added ${role} at ${company}`);
};

const listApplications = () => {
  const applications = readApplications();

  if (applications.length === 0) {
    console.log('No applications yet. Add one with: npm run job -- add "Company" "Role"');
    return;
  }

  applications.forEach((application, index) => {
    console.log(
      `${index + 1}. ${application.company} - ${application.role} [${application.status}] Next: ${application.nextStep}`,
    );
  });
};

const showPlan = () => {
  console.log(`Junior developer job plan:
1. Build a resume from junior-dev-resume-starter.md.
2. Track 5 focused frontend/backend roles before adding more.
3. For each job, match React, TypeScript, Node, API, and Git keywords.
4. Apply with a short project-based pitch instead of a generic note.
5. Follow up after 3 business days with one specific reason you fit.`);
};

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'init':
    createResume();
    showPlan();
    break;
  case 'add':
    addApplication(args);
    break;
  case 'list':
    listApplications();
    break;
  case 'plan':
    showPlan();
    break;
  default:
    console.log(`Job Copilot CLI

Commands:
  npm run job -- init
  npm run job -- add "Company" "Role" ["Source"]
  npm run job -- list
  npm run job -- plan`);
}
