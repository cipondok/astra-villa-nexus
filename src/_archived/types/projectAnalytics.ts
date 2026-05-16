export interface DatabaseTableInfo {
  name: string;
  columns: number;
  policies: number;
  rows: number;
  usage: number;
  hasRLS: boolean;
}

export interface ProjectStatistics {
  totalFiles: number;
  components: number;
  pages: number;
  hooks: number;
  databaseTables: number;
  linesOfCode: number;
  dependencies: number;
  migrations: number;
  healthScore: number;
  securityScore: number;
}

export interface ProjectAnalytics {
  statistics: ProjectStatistics;
  databaseTables: DatabaseTableInfo[];
  lastUpdated: Date;
}
