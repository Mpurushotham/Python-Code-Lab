
export enum ContentType {
  CONCEPT = 'concept',
  LAB = 'lab',
  PROJECT = 'project'
}

export interface CodeSnippet {
  language: 'python';
  code: string;
  description?: string;
}

export interface LabChallenge {
  instruction: string;
  initialCode: string;
  expectedOutput?: string | RegExp;
  hint: string;
  solution: string;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  topics: {
    title: string;
    content: string;
    codeExamples?: CodeSnippet[];
    pitfalls?: string[];
  }[];
  lab: LabChallenge;
  miniProject: LabChallenge;
}

export interface PracticeCategory {
  id: string;
  title: string;
  description: string;
}

export interface PracticeExample {
  id: string;
  categoryId: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  code: string;
  description: string;
}

export interface UserProgress {
  completedModules: number[]; // IDs of completed modules
  currentModuleId: number;
  currentSection: 'intro' | 'topics' | 'lab' | 'project';
}

export interface ConceptSection {
  title: string;
  content: string;
  code: string;
}

export interface ConceptTopic {
  id: string;
  title: string;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  description: string;
  sections: ConceptSection[];
}
