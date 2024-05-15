# Littlefish NFT Wallet Authentication Framework

The npm package is updated to have serve both client and server functions.

Install latest Next JS version

```jsx
npx create-next-app@latest
```

For the demonstration we used the following values:

![Image 1](public/image1.png)


Install littlefish npm package

```jsx
npm install littlefish-nft-auth-framework-beta
```

In your app directory create a “providers.jsx” file.

![Image 2](public/image2.png)


```jsx
"use client"
import { WalletProvider} from 'littlefish-nft-auth-framework-beta/frontend';

export default function Providers({children}) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  )
};
```

In your “app/layout.tsx” file import the Providers and wrap your {children} around the wallet provider.

![Image 3](public/image3.png)


Now you are ready to use the package.

## UI Components

We have created two UI components that serve wallet connection and disconnection.
These are **WalletConnectButton** and **WalletConnectPage**. Both of them can be imported from **littlefish-nft-auth-framework-beta/frontend**

## Client Types, Returned Values, and Function Descriptions

### Types

```typescript
interface Asset {
  policyID: string;
  assetName: string;
  amount: number;
};

interface WalletContextProps {
  isConnected: boolean;
  assets: Asset[];
  connectedWalletId: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  decodeHexToAscii: (processedArray: Asset[]) => Asset[];
  isClient: boolean;
  wallets: string[];
  networkID: number;
  addresses: [string];
};

```

### Hooks

- **`useWallet()`**
  - **Returns**: An object containing:
    - `isConnected` (`boolean`): Indicates if a wallet is currently connected.
    - `wallets` (`Array<string>`): List of detected wallet identifiers.
    - `connectedWalletId` (`string|null`): Identifier of the currently connected wallet.
    - `assets` (`Array<Array<string, string, number>>`): Decoded assets from the connected wallet, each represented as `[policyID, assetName, amount]`.

### Provider Component

- **`WalletProvider`**
  - **Purpose**: Provides wallet context to all child components in the application, allowing them access to wallet data and functions.

### Utility Functions

- **`connectWallet(walletName: string)`**
  - **Returns**: `Promise<void>`
  - **Description**: Attempts to connect to the specified wallet and updates the context with wallet details if successful. The function is asynchronous and resolves without returning any specific data.

- **`disconnectWallet()`**
  - **Returns**: `void`
  - **Description**: Resets connection-related state variables to reflect no active wallet connection. Does not return any data.

- **`decodeHexToAscii(processedArray: Array)`**
  - **Returns**: `Array<Array<string>>`
  - **Description**: Converts hex-encoded assetName strings within the processed array into ASCII strings. Returns an array with elements formatted as [policyID, assetName, amount].

- **`signMessage(walletName: string, isConnected: boolean, message: string, address: string)`**
  - **Returns**: `Promise<[string, string] | void>`
  - **Description**: uses the enabled browser wallet to sign a message to verify the ownership of the current connected wallet.

## Server Types, Returned Values, and Function Descriptions

### Types
```typescript
interface SignupOptions {
    email?: string;
    password?: string;
    walletAddress?: string;
    walletNetwork?: number;
    signature?: string;
    key?: string;
    nonce?: string;
}

interface User {
    email?: string;
    password?: string;
    walletAddress?: string;
    walletNetwork?: number;
}

interface SignupResult {
    success: boolean;
    email?: string;
    passwordHash?: string;
    walletAddress?: string;
    walletNetwork?: number;
    error?: string;
}

interface LoginResult {
    success: boolean;
    error?: string;
}
````
### Authentication Functions


- **`signupUser(options: SignupOptions)`**
    - **Returns**: SignupResult
    - **Description**: Can sign a user up with email and password or a Cardano wallet. It verifies the ownership of the wallet by checking a signed data by the wallet.
- **`loginUser(user: User, options: signupOptions)`**
    - **Returns:** LoginResult
    - **Description**: This function can validate a user with either email and password or a Cardano wallet. It also verifies the ownership of the cardano wallet by verifying the signed data.

### Utility Functions

- **`generateNonce()`**
    - **Returns**: string
    - **Description**: It provides a one time use string to sign a data to the server.
- **`verifyWalletAddress(signature: string, key: string, message: string, hex: string)`**
    - **Returns**: boolean
    - **Description**: It verifies the ownership of the Cardano wallet.
- **`hashPassword(password: string)`**
    - **Returns**: string
    - **Description**: This function hashes the password entered by the user.
- - **`validateEmail(email: string)`**
    - **Returns**: boolean
    - **Description**: This function checks if the entered email address is valid.
- - **`validatePassword(password: string)`**
    - **Returns**: boolean
    - **Description**: Checks if the entered password for:
        - Contains at least one digit.
        - Contains at least one lowercase letter.
        - Contains at least one uppercase letter.
        - Is at least 8 characters long.


## Example Usage

### Client Usage

First you need to import the **useWallet** hook to your component.

```jsx
import { useWallet } from "littlefish-nft-auth-framework-beta/frontend";
```

Use the '**useWallet()**' hook inside your component to get access to several properties and methods such as **isConnected**, **wallets**, **assets**, and functions like **connectWallet**, 00disconnectWallet**, and **decodeHexToAscii**.
```jsx
const {
  isConnected,
  connectWallet,
  disconnectWallet,
  wallets,
  assets,
  networkID,
  addresses,
  decodeHexToAscii,
} = useWallet();
```

#### Wallet Connect

Here is an example of connecting wallet. The wallets array will be displayed to give the user the option which wallet they want to connect.
```jsx
wallets.map((wallet, index) => (
  <a key={index} onClick={() => connectWallet(wallet)}>{wallet}</a>
))

```

After the wallet connection, these will be updated:
- isConnected: It will be **True**
- assets: If there are any assets in the wallet, this will be an array of arrays.

#### Wallet Disconnect
In order to disconnect wallet:

```jsx
<a onClick={() => disconnectWallet()}>Disconnect Wallet</a>
```
This action will update:
- isConnected to **False**.
- assets to an empty array.

#### Displaying Assets

In order to display asset information and use **decodeHexToAscii** function, we initialized these states:
```jsx
const [walletAssets, setWalletAssets] = useState("");
const [isHex, setIsHex] = useState(true);

useEffect(() => {
  setWalletAssets(assets || []);
}, [assets]);
```

Here is how the **decodeHexToAscii** function updates **walletAssets** state:
```jsx
{isHex ? 
  <a onClick={() => {setWalletAssets(decodeHexToAscii(walletAssets)); setIsHex(false)}}>Decode Hex to Ascii</a> : 
  <a onClick={() => {setWalletAssets(assets); setIsHex(true)}}>Show Hex</a>
}

```

Displaying the assets:
```jsx
walletAssets.map((item, index) => (
  <pre key={index}>PolicyID: {item[0]}, Name: {item[1]}, Amount: {item[2]}</pre>
))

```

### Server Usage

All backend functions should be imported like this.
```typescript
import { signupUser, loginUser } from "littlefish-nft-auth-framework-beta/backend";
```

#### Signup

A body is created like this and it is sent to the signupUser function. The body can either have email and password, or wallet information such as walletAddress, walletNetwork, signature, key, and nonce

```typescript
const body = await request.json();
    const {
        email,
        password,
        walletAddress,
        walletNetwork,
        signature,
        key,
        nonce
    } = body;

const result = await signupUser(body)
````
signupUser will return an object in the type:
```typescript
interface SignupResult {
    success: boolean;
    email?: string;
    passwordHash?: string;
    walletAddress?: string;
    walletNetwork?: number;
    error?: string;
}
```

If the signup process is done with email and password, the returned object will have success, email, passwordHash.
If the signup process is done with wallet information, the returned object will have success, walletAddress, walletNetwork.
If the signup process fails it will return success and error.

#### Login

Login object is fed with two objects. A body is created like this and it is sent to the signupUser function. The body can either have email and password, or wallet information such as walletAddress, walletNetwork, signature, key, and nonce.
```typescript
const body = await request.json();
    const {
        email,
        password,
        walletAddress,
        walletNetwork,
        signature,
        key,
        nonce
    } = body;

````

And a user object fetched from the used database:
```typescript
interface User {
    email?: string;
    password?: string;
    walletAddress?: string;
    walletNetwork?: number;
}
```
The loginUser function can be used like this.

```typescript
const result = loginUser(user, body);
```

loginUser will return success and error if failed.

#### Utility Functions

##### Address Verification

verifyWalletAddress function can be used to verify ownership of the connected wallet.
```typescript
const result = verifyWalletAddress(signature: string, key: string, message: string, hex: string)
```

The signature and key can be received with the frontend **signMessage** function via asking the user to sign a nonce with their wallet.
The message is the nonce sent to the user by **signMessage** function. the hex is the reward address of the user wallet. It can be accessed via addresses of the context provider.