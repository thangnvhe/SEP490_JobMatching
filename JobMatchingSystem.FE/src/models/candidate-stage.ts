import { User } from "./user";
import { CV } from "./cv";

export interface CandidateStage {
    id: number;
    candidateJobId: number;
    jobStageId: number;
    status: string;
    interviewDate: string;
    interviewStartTime: string;
    interviewEndTime: string;
    interviewLocation: string;
    googleMeetLink: string;
    hiringManagerFeedback: string;
    jobStageTitle: string;
    user: Pick<User, 'fullName' | 'email' | 'phoneNumber' | 'address' | 'avatarUrl' | 'birthday' | 'gender'>;
    cv: Pick<CV, 'id' | 'name' | 'fileUrl'>;
}
