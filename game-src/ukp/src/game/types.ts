export type EditorialStatus="draft"|"verified"|"inactive";
export type BackendMode="demo"|"online";
export type SessionPhase="answering"|"feedback"|"won"|"summit"|"lost";
export type MachinePhase="ready"|"answering"|"checking"|"moving"|"explanation"|"won"|"lost"|"claiming"|"claimed"|"connectionError";
export type MotionCue="idle"|"celebrate"|"disappointed"|"climb"|"parachute"|"victory";

export interface QuestionOption {id:string;text:string}
export interface PublicQuestion {
  id:string;
  topic:string;
  prompt:string;
  options:QuestionOption[];
  sequence:number;
}
export interface QuestionSource {
  label:string;
  url:string;
  official:boolean;
}
export interface PrivateQuestion extends PublicQuestion {
  correctOptionId:string;
  explanation:string;
  source:QuestionSource;
  officialSourceUrl:string|null;
  verifiedAt:string|null;
  effectivePeriod:string;
  validFrom:string|null;
  validUntil:string|null;
  editorialStatus:EditorialStatus;
  competitionEligible:boolean;
  calculationAssumptions:string|null;
}
export interface AnswerFeedback {
  turnId:string;
  questionId:string;
  selectedOptionId:string|null;
  correctOptionId:string;
  correct:boolean;
  timedOut:boolean;
  explanation:string;
  source:QuestionSource;
  scoreDelta:0|1;
  livesDelta:0|-1;
  positionDelta:0|1;
}
export interface GameResult {
  outcome:"won"|"summit"|"lost";
  reason:"score"|"summit"|"lives"|"questions";
  score:number;
  correctCount:number;
  wrongCount:number;
  position:number;
  totalAnswerMs:number;
  startedAt:number;
  completedAt:number;
}
export interface SessionSnapshot {
  id:string;
  phase:SessionPhase;
  mode:BackendMode;
  score:number;
  correctCount:number;
  wrongCount:number;
  lives:number;
  position:number;
  questionIndex:number;
  questionCount:number;
  totalAnswerMs:number;
  startedAt:number;
  deadlineAt:number|null;
  turnId:string|null;
  question:PublicQuestion|null;
  feedback:AnswerFeedback|null;
  result:GameResult|null;
}
export interface ClaimInput {
  displayName:string;
  email?:string;
  phone?:string;
}
export interface LeaderboardEntry {
  id:string;
  displayName:string;
  score:number;
  wrongCount:number;
  totalAnswerMs:number;
  completedAt:number;
  expiresAt:number;
  position:number;
}
export interface BackendClient {
  readonly mode:BackendMode;
  startOrResumeSession():Promise<SessionSnapshot>;
  submitAnswer(input:{sessionId:string;turnId:string;questionId:string;selectedOptionId:string|null;requestId:string}):Promise<SessionSnapshot>;
  nextQuestion(input:{sessionId:string;requestId:string}):Promise<SessionSnapshot>;
  continueToSummit(input:{sessionId:string;requestId:string}):Promise<SessionSnapshot>;
  claimWin(sessionId:string,input:ClaimInput):Promise<{entry:LeaderboardEntry;duplicate:boolean}>;
  getLeaderboard():Promise<LeaderboardEntry[]>;
  resetSession():Promise<void>;
}

export interface MachineState {
  phase:MachinePhase;
  session:SessionSnapshot|null;
  selectedOptionId:string|null;
  motion:MotionCue;
  error:string|null;
}
export type MachineEvent=
  |{type:"START"}
  |{type:"SESSION";session:SessionSnapshot}
  |{type:"SELECT";optionId:string}
  |{type:"SUBMIT"}
  |{type:"ANSWER";session:SessionSnapshot}
  |{type:"ANIMATION_DONE"}
  |{type:"NEXT"}
  |{type:"CONTINUE"}
  |{type:"CLAIM"}
  |{type:"CLAIMED";session:SessionSnapshot}
  |{type:"ERROR";message:string}
  |{type:"RETRY"}
  |{type:"RESET"};
