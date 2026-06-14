export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institutionId: string | null;
  departmentId: string | null;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  tokens: AuthTokensDto;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  institutionSlug: string;
  matricNo?: string;
  staffId?: string;
  departmentCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}
