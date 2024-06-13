import { LoginOptions, LoginResult, User } from "./types/types";
/**
 * Authentication function to validate users based on email and password or a wallet address or assets.
 * Assumes that user data fetching is handled outside this function.
 *
 * @param {User} user - The user object containing at least email, password hash, or wallet address.
 * @param {LoginOptions} options - The options containing credentials for verification.
 * @return {LoginResult} The result of the authentication.
 */
export declare function loginUser(user: User, options: LoginOptions): Promise<LoginResult>;
//# sourceMappingURL=loginUser.d.ts.map