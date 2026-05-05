export type Likelihood = 'low' | 'med' | 'high';
export type Impact = 'low' | 'med' | 'high';
export type Complexity = 'S' | 'M' | 'L';
export type Currency = 'USD' | 'BRL' | 'EUR';
export type Period = 'month' | 'quarter' | 'year';

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

export interface CostOfInaction {
  currency: Currency;
  low: number;
  high: number;
  period: Period;
  basis: string;
}

export interface SparkPlan {
  elevator: string;
  costOfInaction: CostOfInaction;
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
