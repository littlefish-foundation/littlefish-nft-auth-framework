import { validateEmail, validatePassword, verifyWalletAddress } from "../../utils/utils";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {

    const body = await request.json();
    const { email, password, walletAddress } = body;
    if (!walletAddress) {
        return Response.json({
            error: "Invalid wallet signature",
        }, {
            status: 400,
        });
    }

    if (!validateEmail(email) || !validatePassword(password)) {
        return Response.json({
            error: "Invalid email or password",
        }, {
            status: 400,
        });
    };

    const hash = bcrypt.hashSync(password, 8);

    await prisma.user.create({
        data: {
            email,
            password: hash,
        },
    });

    return Response.json({});
}