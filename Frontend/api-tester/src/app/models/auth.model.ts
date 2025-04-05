export interface UserDto {
    id: string;
    username: string;
    email: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: UserDto;
  }