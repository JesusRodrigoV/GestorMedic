export interface TwoFASetupResponse {
  secret: string;
  qr_code_uri: string;
  backup_codes: string[];
}

export interface TwoFAConfirmPayload {
  code: string;
  secret: string;
}

export interface TwoFAVerifyPayload {
  session_token: string;
  code: string;
}