import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, Loader2, RefreshCcw, XCircle } from 'lucide-react';
import { CandidateStageServices } from '@/services/candidate-stage.service';
import { BaseResponse } from '@/models/base';

type ActionType = 'confirm' | 'reject';

export const InterviewConfirmPage = () => {
    const { token: tokenFromPath } = useParams<{ token: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const token = tokenFromPath || searchParams.get('token') || '';
    const isRejectPath = useMemo(() => location.pathname.includes('/reject/'), [location.pathname]);

    const confirmInterview = async (token: string) => {
        try {
            setLoading(true);
            const response: BaseResponse<any> = await CandidateStageServices.confirmCandidateStages(token);
            return response;
        } catch (error: any) {
            return error;
        } finally {
            setLoading(false);
        }
    }

    const rejectInterview = async (token: string) => {
        try {
            setLoading(true);
            const response: BaseResponse<any> = await CandidateStageServices.rejectCandidateStages(token);
            return response;
        } catch (error: any) {
            return error;
        } finally {
            setLoading(false);
        }
    }

    const extractMessage = (response: any) =>
        response?.response?.data?.result || response?.result || '';

    const handleAction = async (action: ActionType) => {
        setStatus('loading');
        setMessage('');

        const response = action === 'confirm'
            ? await confirmInterview(token)
            : await rejectInterview(token);

        const nextMessage = extractMessage(response) || 'Không thể xử lý yêu cầu';
        const success = Boolean((response as BaseResponse<any>)?.isSuccess ?? (response as any)?.response?.status === 200);

        setMessage(nextMessage);
        setStatus(success ? 'success' : 'error');
    };

    useEffect(() => {
        handleAction(isRejectPath ? 'reject' : 'confirm');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRejectPath]);

    const handleRetry = () => handleAction(isRejectPath ? 'reject' : 'confirm');

    const statusView = useMemo(() => {
        switch (status) {
            case 'success':
                return {
                    tone: 'text-emerald-700',
                    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
                    icon: <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden />,
                    title: 'Thao tác thành công',
                };
            case 'error':
                return {
                    tone: 'text-rose-700',
                    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
                    icon: <XCircle className="h-14 w-14 text-rose-500" aria-hidden />,
                    title: 'Thao tác thất bại',
                };
            default:
                return {
                    tone: 'text-blue-700',
                    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
                    icon: <Loader2 className="h-14 w-14 text-blue-500 animate-spin" aria-hidden />,
                    title: 'Đang xử lý yêu cầu',
                };
        }
    }, [status]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-7 text-center space-y-6 border border-slate-100">
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${statusView.badge}`}>
                    <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                    {statusView.title}
                </div>

                <div className="flex justify-center">{statusView.icon}</div>

                <p className={`text-base leading-relaxed ${statusView.tone}`} aria-live="polite">
                    {loading || status === 'loading'
                        ? 'Đang xử lý yêu cầu, vui lòng chờ...'
                        : message || 'Vui lòng thử lại sau.'}
                </p>

                <div className="flex justify-center gap-3 pt-2">
                    <button
                        onClick={handleRetry}
                        disabled={loading || status === 'loading'}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Thử lại
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    >
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewConfirmPage;

