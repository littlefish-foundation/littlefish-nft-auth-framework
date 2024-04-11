# littlefish-nft-auth-framework

littlefish-nft-auth-framework is a collection of reusable components, context providers, and hooks for building React applications.

## Installation

You can install littlefish-nft-auth-framework via NPM:

```bash
npm install littlefish-nft-auth-framework
```

## Usage

### Components

Import components from `littlefish-nft-auth-framework/dist/components`:

```jsx
import { Button, Card } from 'littlefish-nft-auth-framework';
```

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
### Configuration
For external APIs and environment variables, ensure to set them in your project:
```jsx
littlefish-nft-auth-framework=your-api-key // Blockfrost API Key.
```