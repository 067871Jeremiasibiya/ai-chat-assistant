import { useEffect, useMemo, useState } from 'react';
import {
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiCode,
  FiDownload,
  FiFileText,
  FiPlus,
  FiServer,
  FiTarget,
  FiTerminal,
} from 'react-icons/fi';

type RoleFocus = 'Frontend Junior Developer' | 'Backend Developer';
type JobStatus = 'Saved' | 'Applied' | 'Interview' | 'Follow up';

interface CandidateProfile {
  name: string;
  email: string;
  location: string;
  portfolio: string;
  github: string;
  targetRole: RoleFocus;
  strengths: string;
  projects: string;
}

interface JobLead {
  id: number;
  company: string;
  role: string;
  stack: string[];
  status: JobStatus;
  priority: number;
  nextStep: string;
}

interface NewJobForm {
  company: string;
  role: string;
  stack: string;
  source: string;
}

const starterProfile: CandidateProfile = {
  name: 'Your Name',
  email: 'you@example.com',
  location: 'Remote / Your city',
  portfolio: 'https://your-portfolio.dev',
  github: 'https://github.com/yourname',
  targetRole: 'Frontend Junior Developer',
  strengths: 'React, TypeScript, Tailwind, accessibility, responsive UI',
  projects: 'AI chat app, job tracker dashboard, responsive portfolio',
};

const initialJobs: JobLead[] = [
  {
    id: 1,
    company: 'BrightPath Studio',
    role: 'Junior Frontend Developer',
    stack: ['React', 'TypeScript', 'Tailwind', 'REST'],
    status: 'Saved',
    priority: 92,
    nextStep: 'Customize resume bullets and apply today',
  },
  {
    id: 2,
    company: 'Northstar APIs',
    role: 'Backend Developer Intern',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'Testing'],
    status: 'Applied',
    priority: 84,
    nextStep: 'Send follow-up with API project link',
  },
  {
    id: 3,
    company: 'LaunchGrid',
    role: 'Full Stack Junior Developer',
    stack: ['React', 'Node.js', 'SQL', 'Git'],
    status: 'Interview',
    priority: 88,
    nextStep: 'Prepare STAR stories for project ownership',
  },
];

const roleSkills: Record<RoleFocus, string[]> = {
  'Frontend Junior Developer': ['React', 'TypeScript', 'Tailwind', 'accessibility', 'responsive UI', 'API integration'],
  'Backend Developer': ['Node.js', 'Express', 'SQL', 'REST APIs', 'authentication', 'testing'],
};

const roleProjects: Record<RoleFocus, string> = {
  'Frontend Junior Developer': 'AI chat app, job tracker dashboard, responsive portfolio',
  'Backend Developer': 'REST API task manager, job tracker CLI, SQL-backed CRUD app',
};

const storageKeys = {
  profile: 'job-copilot-profile',
  jobs: 'job-copilot-jobs',
};

const emptyJobForm: NewJobForm = {
  company: '',
  role: '',
  stack: '',
  source: '',
};

const isRoleFocus = (value: unknown): value is RoleFocus => value === 'Frontend Junior Developer' || value === 'Backend Developer';

const readStoredProfile = () => {
  if (typeof window === 'undefined') return starterProfile;

  try {
    const storedProfile = window.localStorage.getItem(storageKeys.profile);
    if (!storedProfile) return starterProfile;

    const parsedProfile = JSON.parse(storedProfile) as Partial<CandidateProfile>;
    return {
      ...starterProfile,
      ...parsedProfile,
      targetRole: isRoleFocus(parsedProfile.targetRole) ? parsedProfile.targetRole : starterProfile.targetRole,
    };
  } catch {
    return starterProfile;
  }
};

const readStoredJobs = () => {
  if (typeof window === 'undefined') return initialJobs;

  try {
    const storedJobs = window.localStorage.getItem(storageKeys.jobs);
    if (!storedJobs) return initialJobs;

    const parsedJobs = JSON.parse(storedJobs) as JobLead[];
    return Array.isArray(parsedJobs) && parsedJobs.length > 0 ? parsedJobs : initialJobs;
  } catch {
    return initialJobs;
  }
};

const storeProfile = (nextProfile: CandidateProfile) => {
  window.localStorage.setItem(storageKeys.profile, JSON.stringify(nextProfile));
};

const storeJobs = (nextJobs: JobLead[]) => {
  window.localStorage.setItem(storageKeys.jobs, JSON.stringify(nextJobs));
};

const statusStyles: Record<JobStatus, string> = {
  Saved: 'bg-slate-100 text-slate-700',
  Applied: 'bg-blue-100 text-blue-700',
  Interview: 'bg-emerald-100 text-emerald-700',
  'Follow up': 'bg-amber-100 text-amber-700',
};

const splitItems = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getStarterStrengths = (role: RoleFocus) => roleSkills[role].slice(0, 5).join(', ');

const buildResume = (profile: CandidateProfile) => {
  const strengths = splitItems(profile.strengths);
  const projects = splitItems(profile.projects);

  return [
    `${profile.name}`,
    `${profile.email} | ${profile.location}`,
    `${profile.portfolio} | ${profile.github}`,
    '',
    `TARGET: ${profile.targetRole}`,
    '',
    'SUMMARY',
    `Entry-level ${profile.targetRole.toLowerCase()} focused on ${strengths.slice(0, 3).join(', ')}. Builds practical projects, documents decisions, and learns quickly from feedback.`,
    '',
    'PROJECTS',
    ...projects.map((project) => `- ${project}: Built and improved features using ${strengths.slice(0, 2).join(' and ')}.`),
    '',
    'SKILLS',
    `- ${strengths.join(', ')}`,
  ].join('\n');
};

const buildPitch = (profile: CandidateProfile, job: JobLead) => {
  const sharedSkills = roleSkills[profile.targetRole].filter((skill) =>
    job.stack.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(jobSkill.toLowerCase())),
  );
  const skillLine = sharedSkills.length > 0 ? sharedSkills.join(', ') : job.stack.slice(0, 3).join(', ');

  return `Hi ${job.company} team,\n\nI am applying for the ${job.role} role. I am building toward ${profile.targetRole} roles and can show hands-on work with ${skillLine}. My strongest projects include ${profile.projects}.\n\nI would love to bring consistent learning, clean implementation, and strong follow-through to your team.\n\n${profile.name}`;
};

function App() {
  const [profile, setProfile] = useState<CandidateProfile>(readStoredProfile);
  const [jobs, setJobs] = useState<JobLead[]>(readStoredJobs);
  const [selectedJobId, setSelectedJobId] = useState(() => jobs[0]?.id ?? initialJobs[0].id);
  const [newJob, setNewJob] = useState<NewJobForm>(emptyJobForm);
  const [saveNotice, setSaveNotice] = useState('Changes save in this browser automatically.');

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const resumeDraft = useMemo(() => buildResume(profile), [profile]);
  const pitchDraft = useMemo(() => buildPitch(profile, selectedJob), [profile, selectedJob]);
  const appliedCount = jobs.filter((job) => job.status !== 'Saved').length;
  const averagePriority = jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + job.priority, 0) / jobs.length) : 0;

  useEffect(() => {
    storeProfile(profile);
  }, [profile]);

  useEffect(() => {
    storeJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    if (!jobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(jobs[0]?.id ?? initialJobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const updateProfile = (field: keyof CandidateProfile, value: string) => {
    setProfile((current) => {
      const nextProfile = { ...current, [field]: value };
      storeProfile(nextProfile);
      return nextProfile;
    });
    setSaveNotice('Profile saved locally.');
  };

  const updateTargetRole = (targetRole: RoleFocus) => {
    setProfile((current) => {
      const nextProfile = {
        ...current,
        targetRole,
        strengths: getStarterStrengths(targetRole),
        projects: roleProjects[targetRole],
      };
      storeProfile(nextProfile);
      return nextProfile;
    });
    setSaveNotice(`${targetRole} starter content loaded and saved.`);
  };

  const updateStatus = (id: number, status: JobStatus) => {
    setJobs((current) => {
      const nextJobs = current.map((job) => (job.id === id ? { ...job, status } : job));
      storeJobs(nextJobs);
      return nextJobs;
    });
    setSaveNotice('Job status saved locally.');
  };

  const addJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const company = newJob.company.trim();
    const role = newJob.role.trim();
    if (!company || !role) return;

    const stack = splitItems(newJob.stack);
    const matchedSkills = roleSkills[profile.targetRole].filter((skill) =>
      stack.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(jobSkill.toLowerCase())),
    );
    const priority = Math.min(98, Math.max(68, 76 + matchedSkills.length * 4));
    const job: JobLead = {
      id: Date.now(),
      company,
      role,
      stack: stack.length > 0 ? stack : roleSkills[profile.targetRole].slice(0, 4),
      status: 'Saved',
      priority,
      nextStep: newJob.source.trim() ? `Review ${newJob.source.trim()} and tailor your resume` : 'Tailor resume bullets and apply',
    };

    setJobs((current) => {
      const nextJobs = [job, ...current];
      storeJobs(nextJobs);
      return nextJobs;
    });
    setSelectedJobId(job.id);
    setNewJob(emptyJobForm);
    setSaveNotice(`${company} saved as a new job lead.`);
  };

  const downloadResume = () => {
    const blob = new Blob([resumeDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'junior-dev-resume-starter.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 shadow-2xl">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
                <FiTarget />
                Job Search Copilot
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Build your first junior dev application pipeline.
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-300">
                Create a starter resume, track frontend and backend roles, and generate a focused pitch without pretending to have experience you do not have.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Metric icon={<FiBriefcase />} label="Tracked jobs" value={jobs.length.toString()} />
              <Metric icon={<FiCheckCircle />} label="Active applications" value={appliedCount.toString()} />
              <Metric icon={<FiClipboard />} label="Average match" value={`${averagePriority}%`} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card title="1. Build your starter profile" icon={<FiFileText />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField testId="profile-name" label="Name" value={profile.name} onChange={(value) => updateProfile('name', value)} />
              <TextField testId="profile-email" label="Email" value={profile.email} onChange={(value) => updateProfile('email', value)} />
              <TextField testId="profile-location" label="Location" value={profile.location} onChange={(value) => updateProfile('location', value)} />
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Target role
                <select
                  data-testid="target-role"
                  value={profile.targetRole}
                  onChange={(event) => updateTargetRole(event.target.value as RoleFocus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2"
                >
                  <option>Frontend Junior Developer</option>
                  <option>Backend Developer</option>
                </select>
              </label>
              <TextField testId="profile-portfolio" label="Portfolio URL" value={profile.portfolio} onChange={(value) => updateProfile('portfolio', value)} />
              <TextField testId="profile-github" label="GitHub URL" value={profile.github} onChange={(value) => updateProfile('github', value)} />
            </div>
            <TextArea testId="profile-strengths" label="Skills, separated by commas" value={profile.strengths} onChange={(value) => updateProfile('strengths', value)} />
            <TextArea testId="profile-projects" label="Projects, separated by commas" value={profile.projects} onChange={(value) => updateProfile('projects', value)} />
            <div data-testid="save-notice" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              {saveNotice}
            </div>
          </Card>

          <Card title="2. Resume draft" icon={<FiDownload />}>
            <pre data-testid="resume-draft" className="max-h-[31rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
              {resumeDraft}
            </pre>
            <button
              onClick={downloadResume}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              <FiDownload />
              Download resume starter
            </button>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card title="3. Job tracker" icon={<FiBriefcase />}>
            <form onSubmit={addJob} className="grid gap-3 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-indigo-700">
                <FiPlus />
                Add a real job lead
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField testId="new-job-company" label="Company" value={newJob.company} onChange={(value) => setNewJob((current) => ({ ...current, company: value }))} />
                <TextField testId="new-job-role" label="Role" value={newJob.role} onChange={(value) => setNewJob((current) => ({ ...current, role: value }))} />
              </div>
              <TextField testId="new-job-stack" label="Stack / keywords" value={newJob.stack} onChange={(value) => setNewJob((current) => ({ ...current, stack: value }))} />
              <TextField testId="new-job-source" label="Source URL or note" value={newJob.source} onChange={(value) => setNewJob((current) => ({ ...current, source: value }))} />
              <button
                data-testid="save-job"
                type="submit"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
              >
                <FiPlus />
                Save job lead
              </button>
            </form>
            <div className="grid gap-4">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  data-testid={`job-card-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedJobId === job.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{job.company}</p>
                      <h3 className="text-xl font-black text-slate-950">{job.role}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">{job.priority}% match</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.stack.map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <select
                      data-testid={`job-status-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      value={job.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => updateStatus(job.id, event.target.value as JobStatus)}
                      className={`rounded-full border-0 px-3 py-2 text-sm font-bold ${statusStyles[job.status]}`}
                    >
                      <option>Saved</option>
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Follow up</option>
                    </select>
                    <p className="text-sm font-medium text-slate-500">{job.nextStep}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="4. Tailored pitch" icon={<FiClipboard />}>
            <div data-testid="selected-job" className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-700">Selected role</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">{selectedJob.role}</h3>
              <p className="text-slate-600">{selectedJob.company}</p>
            </div>
            <pre data-testid="tailored-pitch" className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">{pitchDraft}</pre>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Keep it honest: this tool helps tailor your story, but you should only claim skills and projects you can explain.
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Step icon={<FiCode />} title="Frontend proof">
            Build a responsive React project, deploy it, and link it in every application.
          </Step>
          <Step icon={<FiServer />} title="Backend proof">
            Add a small REST API with auth or database work so backend jobs have evidence.
          </Step>
          <Step icon={<FiTerminal />} title="CLI automation">
            Run npm run job:init to create local starter files for your search.
          </Step>
        </section>
      </section>
    </main>
  );
}

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Card({ title, icon, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">{icon}</span>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testId?: string;
}

function TextField({ label, value, onChange, testId }: FieldProps) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      {label}
      <input
        data-testid={testId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, testId }: FieldProps) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        data-testid={testId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2"
      />
    </label>
  );
}

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-3 text-slate-300">
        <span className="text-emerald-300">{icon}</span>
        {label}
      </div>
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
  );
}

interface StepProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Step({ icon, title, children }: StepProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
      <div className="mb-4 inline-flex rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">{icon}</div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-slate-300">{children}</p>
    </div>
  );
}

export default App;
