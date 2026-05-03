/**
 * Judge0 v1.13+ HTTP API types. Subset relevant to the orchestrator: submit
 * a single source + stdin, poll for completion, parse the result.
 *
 * https://github.com/judge0/judge0/wiki/Submissions
 */

export interface Judge0SubmitRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number; // seconds (float)
  wall_time_limit?: number; // seconds (float)
  memory_limit?: number; // KB
  /** Optional CLI arguments passed verbatim. */
  command_line_arguments?: string;
}

/**
 * Judge0 submission status. The numeric `id` is canonical:
 *   1 = In Queue
 *   2 = Processing
 *   3 = Accepted
 *   4 = Wrong Answer
 *   5 = Time Limit Exceeded
 *   6 = Compilation Error
 *   7 = Runtime Error (SIGSEGV)
 *   8–12 = Runtime Error (other signals)
 *   13 = Internal Error
 *   14 = Exec Format Error
 */
export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0SubmissionResult {
  token?: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
  exit_signal?: number | null;
  status: Judge0Status;
  /** Wall time in seconds (string per Judge0 quirk; client must parse). */
  time: string | null;
  /** Memory in KB. */
  memory: number | null;
}

/**
 * Subset Judge0 statuses that mean "the run finished" (terminal). 1/2 are
 * non-terminal (queued / processing).
 */
export const TERMINAL_STATUS_IDS = new Set<number>([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
