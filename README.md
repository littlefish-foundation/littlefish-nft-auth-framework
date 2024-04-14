# littlefish-nft-auth-framework

littlefish-nft-auth-framework is a collection of reusable components, context providers, and hooks for building React applications.

## Installation

You can install littlefish-nft-auth-framework via NPM:

```bash
npm install littlefish-nft-auth-framework
```

## Usage

### Context Providers
```jsx
Import context providers from 'littlefish-nft-auth-framework/contexts';
```

```jsx
import { WalletContext } from 'littlefish-nft-auth-framework';
```
Wrap your app with the context provider:
```jsx
<WalletProvider>
  <App />
</WalletProvider>
```