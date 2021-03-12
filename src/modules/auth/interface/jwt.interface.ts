interface Token {
  accessToken: string;
  expiresIn: number;
}

export interface JwtInterface {
  token: Token;
}
