import { validateEmail, validatePassword, verifyWalletAddress } from "../../utils/utils";
import bcrypt from "bcryptjs";
import * as jose from "jose";

type LoginOptions = {
    jwtSecret: string;
    findUserByEmail: (email: string) => Promise<any>;
    findUserByWalletAddress: (walletAddress: string) => Promise<any>;
    hex: string;
    networkID: number;
    message: string;
    key: string;
    signature: string;
};

export async function login(email: string, password: string, walletAddress: string, options: LoginOptions): Promise<string | Error> {
    let user;
    if (walletAddress) {

        // Validate wallet address using external utility functions
        const isValidSignature = verifyWalletAddress(options.signature, options.key, options.message, options.hex, options.networkID);
        if (!isValidSignature) {
            throw new Error("Invalid wallet signature");
        }

        // Find user using provided findUserByWalletAddress function
        user = await options.findUserByWalletAddress(walletAddress);
        if (!user) {
            throw new Error("Invalid wallet address");
        }
    } else {
        // Validate email and password using external utility functions
        if (!validateEmail(email) || !validatePassword(password)) {
            throw new Error("Invalid email or password");
        }

        // Find user using provided findUserByEmail function
        user = await options.findUserByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Compare password hashes using bcrypt
        const isCorrectPassword = bcrypt.compareSync(password, user.password);
        if (!isCorrectPassword) {
            throw new Error("Invalid email or password");
        }
    }
    const secret = new TextEncoder().encode(options.jwtSecret);
    const alg = "HS256";

    // Sign the JWT
    const jwt = await new jose.SignJWT({ name: user.name })
        .setProtectedHeader({ alg })
        .setExpirationTime("72h")
        .setSubject(user.id.toString())
        .sign(secret);

    return jwt;
}