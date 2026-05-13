import http from './http';
import type { MeetingApiResponse } from '../types/meeting';

export async function fetchMeetings(params?: Record<string, any>): Promise<MeetingApiResponse> {
  const response = await http.get<MeetingApiResponse>('/meetings', { params });
  return response.data;
}
