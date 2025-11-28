import { User } from "./user";
import { CV } from "./cv";

export interface CandidateStage {
    id: number;
    candidateJobId: number;
    jobStageId: number;
    status: string;
    scheduleTime: string;
    interviewLocation: string;
    googleMeetLink: string;
    hiringManagerFeedback: string;
    jobStageTitle: string;
    user: User;
    cv: CV;
}
