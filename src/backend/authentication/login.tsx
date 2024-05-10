// login.ts
type LoginCredentials = {
    email: string;
    password: string;
    walletAddress : string;
};

type LoginConfig = {
    apiUrl: string; // User must define the full URL to the login endpoint
    onSuccess: (token: string) => void; // Callback function for successful login
    onError: (errorMessage: string) => void; // Callback function for handling errors
};

export async function loginAction(credentials: LoginCredentials, config: LoginConfig): Promise<void> {
    const { email, password, walletAddress } = credentials;
    const { apiUrl, onSuccess, onError } = config;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const json = await response.json();
        if (response.ok) {
            onSuccess(json.token); // Let the user handle the token (e.g., setting cookies, local storage)
        } else {
            onError(json.error);
        }
    } catch (error) {
        onError('Failed to fetch: ' + error.message);
    }
}
