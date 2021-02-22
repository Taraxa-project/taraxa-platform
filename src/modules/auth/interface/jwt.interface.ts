interface Token {
  access_token: string;
  expires_in: number;
}

export interface JwtInterface {
  token: Token;
}
