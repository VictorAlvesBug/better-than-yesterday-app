import { API_URL } from '@/src/utils/constants';
import axios from 'axios';
import {
  ApiCheckIn,
  ApiHabit,
  ApiChallenge,
  ApiChallengeMemberDetails,
  ApiChallengeRanking,
  ApiChallengeRankingWithCurrentUser,
  ApiChallengeWithMembers,
  ApiPenalty,
  ApiUser,
  ApiUserWithChallenges,
  CreateCheckInPayload,
  CreateHabitPayload,
  CreateChallengePayload,
  CreateUserPayload,
  ListCheckInsFilter,
  ListHabitsFilter,
  ListChallengesFilter,
  ListUsersFilter,
  PresignedUploadUrl,
  ReviewCheckInPayload,
  UpdateUserPayload,
} from './apiMappers';

export type {
  ListCheckInsFilter, ListHabitsFilter, ListChallengesFilter, ListUsersFilter
} from './apiMappers';

export type ApiResponse<T> = {
  data: T;
  status: number;
  reason?: string;
  rejectionType: number;
};

export const isSuccessfulStatusCode = (statusCode: number) =>
  statusCode >= 200 && statusCode <= 299;

const API_DEBUG = process.env.EXPO_PUBLIC_API_DEBUG === 'true';

function logApi(direction: string, url: string, payload?: unknown) {
  if (!API_DEBUG)
    return;

  if (payload === undefined)
    console.log(`[API ${direction}]`, url);
  else
    console.log(`[API ${direction}]`, url, payload);
}

const resolveStatus = (status: number) => {
  switch (status) {
    case 0: return 'Falha';
    case 1: return 'Sucesso';
    case 2: return 'Rejeitado';
    default: return 'Status desconhecido';
  }
};

export const logErrorAndThrow = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    if (API_DEBUG)
      console.log('[API ✗]', error);

    throw error;
  }

  if (API_DEBUG)
    console.log('[API ✗]', error.config?.url, error.response?.data ?? error.message);

  if (error.response?.data) {
    const status = resolveStatus(error.response.data.status);
    const reason = error.response.data.reason ?? 'No reason provided';
    throw new Error(`${status}: ${reason}`);
  }

  const statusCode = error.response?.status;
  const strResponseData = JSON.stringify(error.response?.data ?? {});
  throw new Error(`API Error - StatusCode: ${statusCode} - Response Data: ${strResponseData}`);
};

function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '')
      searchParams.append(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function getData<T>(url: string): Promise<T> {
  try {
    logApi('→ GET', url);
    const response = await axios.get<ApiResponse<T>>(url);
    if (isSuccessfulStatusCode(response.status)) {
      logApi('✓ GET', url, response.data.data);
      return response.data.data;
    }

    throw new Error(`GET ${url} failed with status ${response.status}`);
  } catch (error) {
    logErrorAndThrow(error);
    throw error;
  }
}

async function getListData<T>(url: string): Promise<T[]> {
  return getData<T[]>(url);
}

async function postData<TBody, TResult>(url: string, body?: TBody): Promise<TResult> {
  try {
    logApi('→ POST', url, body);
    const response = await axios.post<ApiResponse<TResult>>(url, body);
    if (isSuccessfulStatusCode(response.status)) {
      logApi('✓ POST', url, response.data.data);
      return response.data.data;
    }

    throw new Error(`POST ${url} failed with status ${response.status}`);
  } catch (error) {
    logErrorAndThrow(error);
    throw error;
  }
}

async function putData<TBody, TResult>(url: string, body?: TBody): Promise<TResult> {
  try {
    logApi('→ PUT', url, body);
    const response = await axios.put<ApiResponse<TResult>>(url, body);
    if (isSuccessfulStatusCode(response.status)) {
      logApi('✓ PUT', url, response.data.data);
      return response.data.data;
    }

    throw new Error(`PUT ${url} failed with status ${response.status}`);
  } catch (error) {
    logErrorAndThrow(error);
    throw error;
  }
}

async function deleteRequest(url: string): Promise<void> {
  try {
    logApi('→ DELETE', url);
    const response = await axios.delete(url);
    if (isSuccessfulStatusCode(response.status)) {
      logApi('✓ DELETE', url);
      return;
    }

    throw new Error(`DELETE ${url} failed with status ${response.status}`);
  } catch (error) {
    logErrorAndThrow(error);
    throw error;
  }
}

async function deleteData<T>(url: string): Promise<T> {
  try {
    logApi('→ DELETE', url);
    const response = await axios.delete<ApiResponse<T>>(url);
    if (isSuccessfulStatusCode(response.status)) {
      logApi('✓ DELETE', url, response.data.data);
      return response.data.data;
    }

    throw new Error(`DELETE ${url} failed with status ${response.status}`);
  } catch (error) {
    logErrorAndThrow(error);
    throw error;
  }
}

export const backendApi = {
  getUserById: (id: string) =>
    getData<ApiUser>(`${API_URL}/Users/${id}`),

  listUsers: (filter?: ListUsersFilter) =>
    getListData<ApiUser>(`${API_URL}/Users${buildQueryString({ email: filter?.email })}`),

  registerUser: (body: CreateUserPayload) =>
    postData<CreateUserPayload, ApiUser>(`${API_URL}/Users`, body),

  updateUser: (body: UpdateUserPayload) =>
    putData<UpdateUserPayload, ApiUser>(`${API_URL}/Users`, body),

  getHabitById: (id: string) =>
    getData<ApiHabit>(`${API_URL}/Habits/${id}`),

  listHabits: (filter?: ListHabitsFilter) =>
    getListData<ApiHabit>(`${API_URL}/Habits${buildQueryString({ name: filter?.name })}`),

  createHabit: (body: CreateHabitPayload) =>
    postData<CreateHabitPayload, ApiHabit>(`${API_URL}/Habits`, body),

  getChallengeById: (id: string) =>
    getData<ApiChallenge>(`${API_URL}/Challenges/${id}`),

  listChallenges: (filter?: ListChallengesFilter) =>
    getListData<ApiChallenge>(`${API_URL}/Challenges${buildQueryString({
      ownerId: filter?.ownerId,
      habitId: filter?.habitId,
      status: filter?.status,
      type: filter?.type,
    })}`),

  createChallenge: (body: CreateChallengePayload) =>
    postData<CreateChallengePayload, ApiChallenge>(`${API_URL}/Challenges`, body),

  getChallengeWithMembersByChallengeId: (challengeId: string) =>
    getData<ApiChallengeWithMembers>(`${API_URL}/Challenges/${challengeId}/Members`),

  getUserWithChallengesByUserId: (userId: string) =>
    getData<ApiUserWithChallenges>(`${API_URL}/Users/${userId}/Challenges`),

  getChallengeMemberDetails: (challengeId: string, userId: string) =>
    getData<ApiChallengeMemberDetails>(`${API_URL}/Challenges/${challengeId}/Members/${userId}`),

  joinChallenge: (challengeId: string, userId: string) =>
    postData<undefined, ApiChallengeMemberDetails>(`${API_URL}/Challenges/${challengeId}/Members/${userId}`),

  leaveChallenge: (challengeId: string, userId: string) =>
    deleteRequest(`${API_URL}/Challenges/${challengeId}/Members/${userId}`),

  blockChallengeMember: (challengeId: string, userId: string) =>
    postData<undefined, ApiChallengeMemberDetails>(`${API_URL}/Challenges/${challengeId}/Members/${userId}/Block`),

  unblockChallengeMember: (challengeId: string, userId: string) =>
    deleteData<ApiChallengeMemberDetails>(`${API_URL}/Challenges/${challengeId}/Members/${userId}/Block`),

  getCheckInById: (id: string) =>
    getData<ApiCheckIn>(`${API_URL}/CheckIns/${id}`),

  listCheckIns: (filter?: ListCheckInsFilter) =>
    getListData<ApiCheckIn>(`${API_URL}/CheckIns${buildQueryString({
      challengeId: filter?.challengeId,
      userId: filter?.userId,
      date: filter?.date,
      status: filter?.status,
    })}`),

  addCheckIn: (body: CreateCheckInPayload) =>
    postData<CreateCheckInPayload, ApiCheckIn>(`${API_URL}/CheckIns`, body),

  replaceCheckIn: (checkInId: string, body: { userId: string; title: string; evidencePhotoUrl: string }) =>
    putData<{ userId: string; title: string; evidencePhotoUrl: string }, ApiCheckIn>(`${API_URL}/CheckIns/${checkInId}`, body),

  reviewCheckIn: (checkInId: string, body: ReviewCheckInPayload) =>
    postData<ReviewCheckInPayload, ApiCheckIn>(`${API_URL}/CheckIns/${checkInId}/Reviews`, body),

  removeReview: (checkInId: string, reviewerId: string) =>
    deleteData<ApiCheckIn>(`${API_URL}/CheckIns/${checkInId}/Reviews/${reviewerId}`),

  getPresignedUploadUrl: (fileName: string, contentType: string) =>
    postData<{ fileName: string; contentType: string }, PresignedUploadUrl>(
      `${API_URL}/Uploads/PresignedUrl`,
      { fileName, contentType }
    ),

    getChallengeRanking: (challengeId: string) =>
      getData<ApiChallengeRanking>(
        `${API_URL}/Challenges/${challengeId}/Ranking`
      ),

    getChallengeRankingWithCurrentUser: (challengeId: string, userId: string) =>
      getData<ApiChallengeRankingWithCurrentUser>(
        `${API_URL}/Challenges/${challengeId}/Ranking${buildQueryString({ userId })}`
      ),

  listPenaltiesByChallengeId: (challengeId: string) =>
    getListData<ApiPenalty>(`${API_URL}/Challenges/${challengeId}/Penalties`),

  listPenaltiesByChallengeMember: (challengeId: string, userId: string) =>
    getListData<ApiPenalty>(`${API_URL}/Challenges/${challengeId}/Members/${userId}/Penalties`),

  payPenalty: (challengeId: string, penaltyId: string, confirmedByUserId: string) =>
    postData<{ confirmedByUserId: string }, ApiPenalty>(
      `${API_URL}/Challenges/${challengeId}/Penalties/${penaltyId}/Pay`,
      { confirmedByUserId }
    ),

  createPixCharge: (challengeId: string, penaltyId: string, userId: string) =>
    postData<{ userId: string }, { externalId: string; copyAndPaste: string; amount: number }>(
      `${API_URL}/Challenges/${challengeId}/Penalties/${penaltyId}/Pix`,
      { userId }
    ),

  updateChallengePeriod: (challengeId: string, body: { ownerId: string; startsAt: string; endsAt: string }) =>
    putData<{ ownerId: string; startsAt: string; endsAt: string }, ApiChallenge>(
      `${API_URL}/Challenges/${challengeId}/Period`,
      body
    ),

  cancelChallenge: (challengeId: string) =>
    deleteData<ApiChallenge>(`${API_URL}/Challenges/${challengeId}`),

  createCheckInReport: (body: { checkInId: string; reporterId: string; reason: string }) =>
    postData<{ checkInId: string; reporterId: string; reason: string }, { id: string }>(
      `${API_URL}/CheckInReports`,
      body
    ),

  listCheckInReports: (challengeId: string, requesterId: string) =>
    getListData<{
      id: string;
      checkInId: string;
      reporterId: string;
      reporterName?: string;
      targetUserId: string;
      reason: string;
      createdAt: string;
      checkInTitle?: string;
      evidencePhotoUrl?: string;
    }>(
      `${API_URL}/CheckInReports${buildQueryString({ challengeId, requesterId })}`
    ),

  generateNotifications: (userId: string) =>
    postData<undefined, { id: string; challengeId: string; kind: string; message: string; createdAt: string; payload?: { type: string; challengeId: string; checkInId?: string; reviewerId?: string; authorId?: string; reporterId?: string; targetUserId?: string } }[]>(
      `${API_URL}/Users/${userId}/Notifications`
    ),
};
