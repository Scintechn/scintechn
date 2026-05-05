export type Likelihood = 'low' | 'med' | 'high';
export type Impact = 'low' | 'med' | 'high';
export type Complexity = 'S' | 'M' | 'L';

export interface SparkRisk {
  title: string;
  likelihood: Likelihood;
  impact: Impact;
  mitigation: string;
}

export interface SparkPhase {
  label: string;
  deliverable: string;
  definitionOfDone: string;
  complexity: Complexity;
}

export interface SparkPlan {
  elevator: string;
  scope: { in: string[]; out: string[] };
  stack: string[];
  phases: SparkPhase[];
  risks: SparkRisk[];
  openQuestions: string[];
}

export interface SparkRefusal {
  refusal: '<<NOT_A_BUILD_REQUEST>>';
}

export type SparkResponse = SparkPlan | SparkRefusal;

export function isRefusal(r: SparkResponse): r is SparkRefusal {
  return 'refusal' in r;
}
