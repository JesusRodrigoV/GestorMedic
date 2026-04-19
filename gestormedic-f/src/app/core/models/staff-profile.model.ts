export interface StaffProfile {
  id: number;
  user_id: number;
  employee_id: string;
  position: string;
}

export interface UpdateStaffProfilePayload {
  employee_id: string;
  position: string;
}