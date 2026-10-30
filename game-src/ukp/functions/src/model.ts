import type {Timestamp} from "firebase-admin/firestore";

export const SERVER_CONFIG={
  stairCount:100,
  winScore:60,
  startLives:41,
  answerMs:60_000,
  questionCount:100,
  leaderboardMs:7*24*60*60*1000,
  maxLeaderboardRows:50,
} as const;

export interface Option{id:string;text:string}
export interface Source{label:string;url:string;official:boolean}
export interface PrivateQuestion{
  id:string;sequence:number;topic:string;prompt:string;options:Option[];correctOptionId:string;
  explanation:string;source:Source;officialSourceUrl:string|null;verifiedAt:string|null;
  effectivePeriod:string;validFrom:string|null;validUntil:string|null;
  editorialStatus:"draft"|"verified"|"inactive";competitionEligible:boolean;
  calculationAssumptions:string|null;
  sourceDocumentQuestionNumber?:number;reviewedAt?:string;reviewNotes?:string[];
}
export interface Turn{id:string;questionId:string;startedAt:Timestamp;deadlineAt:Timestamp;optionIds:string[]}
export interface Feedback{
  turnId:string;questionId:string;selectedOptionId:string|null;correctOptionId:string;correct:boolean;
  timedOut:boolean;explanation:string;source:Source;scoreDelta:0|1;livesDelta:0|-1;positionDelta:0|1;
}
export type TerminalOutcome="won"|"summit"|"lost";
export interface PendingOutcome{outcome:TerminalOutcome;reason:"score"|"summit"|"lives"|"questions"}
export interface SessionDocument{
  ownerUid:string;bankVersion:string;phase:"answering"|"feedback"|TerminalOutcome;active:boolean;
  order:string[];cursor:number;score:number;correctCount:number;wrongCount:number;lives:number;
  position:number;totalAnswerMs:number;startedAt:Timestamp;completedAt:Timestamp|null;updatedAt:Timestamp;
  turn:Turn|null;feedback:Feedback|null;pendingOutcome:PendingOutcome|null;summitMode:boolean;
}
export interface PublicQuestion{id:string;topic:string;prompt:string;options:Option[];sequence:number}
export interface GameResult{
  outcome:TerminalOutcome;reason:PendingOutcome["reason"];score:number;correctCount:number;wrongCount:number;
  position:number;totalAnswerMs:number;startedAt:number;completedAt:number;
}
export interface SessionSnapshot{
  id:string;phase:SessionDocument["phase"];mode:"online";score:number;correctCount:number;wrongCount:number;
  lives:number;position:number;questionIndex:number;questionCount:number;totalAnswerMs:number;startedAt:number;
  deadlineAt:number|null;turnId:string|null;question:PublicQuestion|null;feedback:Feedback|null;result:GameResult|null;
}
export interface AnswerComputation{
  correct:boolean;timedOut:boolean;durationMs:number;score:number;correctCount:number;wrongCount:number;
  lives:number;position:number;pendingOutcome:PendingOutcome|null;
}
export interface PublicLeaderboardEntry{
  id:string;displayName:string;score:number;wrongCount:number;totalAnswerMs:number;
  completedAt:number;expiresAt:number;position:number;
}
