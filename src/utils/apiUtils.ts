import { API_URL } from '@/src/utils/constants';
import axios from 'axios';
import { toastErrorMessage } from './toastUtils';
import {
  ApiCheckIn,
  ApiHabit,
  ApiPlan,
  ApiPlanMemberDetails,
  ApiPlanRanking,
  ApiPlanWithMembers,
  ApiUseDayOffResult,
  ApiUser,
  ApiUserWithPlans,
  CreateCheckInPayload,
  CreateHabitPayload,
  CreatePlanPayload,
  CreateUserPayload,
  ListCheckInsFilter,
  ListHabitsFilter,
  ListPlansFilter,
  ListUsersFilter,
  PresignedUploadUrl,
  ReviewCheckInPayload,
} from './apiMappers';

export type {
  ListPlansFilter,
  ListCheckInsFilter,
  ListUsersFilter,
  ListHabitsFilter,
} from './apiMappers';

export type ApiResponse<T> = {
  data: T;
  status: number;
  reason?: string;
  rejectionType: number;
};

export const isSuccessfulStatusCode = (statusCode: number) =>
  statusCode >= 200 && statusCode <= 299;

const resolveStatus = (status: number) => {
  switch (status) {
    case 0: return 'Failure';
    case 1: return 'Success';
    case 2: return 'Rejected';
    default: return 'Unknown status';
  }
};

export const logError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    console.error('Unexpected error:', error);
    return;
  }

  const statusCode = error.response?.status;
  const strResponseData = JSON.stringify(error.response?.data ?? {});
  console.error(`API Error - StatusCode: ${statusCode} - Response Data: ${strResponseData}`);

  if (error.response?.data) {
    const status = resolveStatus(error.response.data.status);
    const reason = error.response.data.reason ?? 'No reason provided';
    toastErrorMessage(`${status}: ${reason}`);
  }
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
    const response = await axios.get<ApiResponse<T>>(url);
    if (isSuccessfulStatusCode(response.status))
      return response.data.data;

    throw new Error(`GET ${url} failed with status ${response.status}`);
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function getListData<T>(url: string): Promise<T[]> {
  return getData<T[]>(url);
}

async function postData<TBody, TResult>(url: string, body?: TBody): Promise<TResult> {
  try {
    const response = await axios.post<ApiResponse<TResult>>(url, body);
    if (isSuccessfulStatusCode(response.status))
      return response.data.data;

    throw new Error(`POST ${url} failed with status ${response.status}`);
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function deleteRequest(url: string): Promise<void> {
  try {
    const response = await axios.delete(url);
    if (isSuccessfulStatusCode(response.status))
      return;

    throw new Error(`DELETE ${url} failed with status ${response.status}`);
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function deleteData<T>(url: string): Promise<T> {
  try {
    const response = await axios.delete<ApiResponse<T>>(url);
    if (isSuccessfulStatusCode(response.status))
      return response.data.data;

    throw new Error(`DELETE ${url} failed with status ${response.status}`);
  } catch (error) {
    logError(error);
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

  getHabitById: (id: string) =>
    getData<ApiHabit>(`${API_URL}/Habits/${id}`),

  listHabits: (filter?: ListHabitsFilter) =>
    getListData<ApiHabit>(`${API_URL}/Habits${buildQueryString({ name: filter?.name })}`),

  createHabit: (body: CreateHabitPayload) =>
    postData<CreateHabitPayload, ApiHabit>(`${API_URL}/Habits`, body),

  getPlanById: (id: string) =>
    getData<ApiPlan>(`${API_URL}/Plans/${id}`),

  listPlans: (filter?: ListPlansFilter) =>
    getListData<ApiPlan>(`${API_URL}/Plans${buildQueryString({
      ownerId: filter?.ownerId,
      habitId: filter?.habitId,
      status: filter?.status,
      type: filter?.type,
    })}`),

  createPlan: (body: CreatePlanPayload) =>
    postData<CreatePlanPayload, ApiPlan>(`${API_URL}/Plans`, body),

  getPlanWithMembersByPlanId: (planId: string) =>
    getData<ApiPlanWithMembers>(`${API_URL}/Plans/${planId}/Members`),

  getUserWithPlansByUserId: (userId: string) =>
    getData<ApiUserWithPlans>(`${API_URL}/Users/${userId}/Plans`),

  getPlanMemberDetails: (planId: string, userId: string) =>
    getData<ApiPlanMemberDetails>(`${API_URL}/Plans/${planId}/Members/${userId}`),

  joinPlan: (planId: string, userId: string) =>
    postData<undefined, ApiPlanMemberDetails>(`${API_URL}/Plans/${planId}/Members/${userId}`),

  leavePlan: (planId: string, userId: string) =>
    deleteRequest(`${API_URL}/Plans/${planId}/Members/${userId}`),

  blockPlanMember: (planId: string, userId: string) =>
    postData<undefined, ApiPlanMemberDetails>(`${API_URL}/Plans/${planId}/Members/${userId}/Block`),

  unblockPlanMember: (planId: string, userId: string) =>
    deleteData<ApiPlanMemberDetails>(`${API_URL}/Plans/${planId}/Members/${userId}/Block`),

  getCheckInById: (id: string) =>
    getData<ApiCheckIn>(`${API_URL}/CheckIns/${id}`),

  listCheckIns: (filter?: ListCheckInsFilter) =>
    getListData<ApiCheckIn>(`${API_URL}/CheckIns${buildQueryString({
      planId: filter?.planId,
      userId: filter?.userId,
      date: filter?.date,
      status: filter?.status,
    })}`),

  addCheckIn: (body: CreateCheckInPayload) =>
    postData<CreateCheckInPayload, ApiCheckIn>(`${API_URL}/CheckIns`, body),

  reviewCheckIn: (checkInId: string, body: ReviewCheckInPayload) =>
    postData<ReviewCheckInPayload, ApiCheckIn>(`${API_URL}/CheckIns/${checkInId}/Reviews`, body),

  removeReview: (checkInId: string, reviewerId: string) =>
    deleteData<ApiCheckIn>(`${API_URL}/CheckIns/${checkInId}/Reviews/${reviewerId}`),

  getPresignedUploadUrl: (fileName: string, contentType: string) =>
    postData<{ fileName: string; contentType: string }, PresignedUploadUrl>(
      `${API_URL}/Uploads/PresignedUrl`,
      { fileName, contentType }
    ),

  getPlanRanking: (planId: string, userId?: string) =>
    getData<ApiPlanRanking>(
      `${API_URL}/Plans/${planId}/Ranking${buildQueryString({ userId })}`
    ),

  useDayOff: (planId: string, userId: string, date: string) =>
    postData<{ date: string }, ApiUseDayOffResult>(
      `${API_URL}/Plans/${planId}/Members/${userId}/DayOffs`,
      { date }
    ),

  getDayOffAvailability: (planId: string, userId: string) =>
    getData<number>(`${API_URL}/Plans/${planId}/Members/${userId}/DayOffs/Available`),
};
