# littlefish-nft-futh-framework

littlefish-nft-futh-framework is a collection of reusable components, context providers, and hooks for building React applications.

## Installation

You can install littlefish-nft-futh-framework via NPM:

```bash
npm install littlefish-nft-futh-framework
```

## Usage

### Components

Import components from `littlefish-nft-futh-framework/dist/components`:

```jsx
import { Button, Card } from 'littlefish-nft-futh-framework';
```

### Context Providers
```jsx
Import context providers from 'littlefish-nft-futh-framework/contexts';
```


```jsx
import { WalletContext } from 'littlefish-nft-futh-framework';
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
littlefish-nft-futh-framework=your-api-key // Blockfrost API Key.
```