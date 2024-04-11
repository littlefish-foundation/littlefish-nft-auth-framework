# My React Boilerplate

My React Boilerplate is a collection of reusable components, context providers, and hooks for building React applications.

## Installation

You can install My React Boilerplate via NPM:

```bash
npm install littlefish-boilerplate
```

## Usage

### Components

Import components from `littlefish-boilerplate/components`:

```jsx
import { Button, Card } from 'littlefish-boilerplate';
```

### Context Providers
Import context providers from littlefish-boilerplate/contexts:

```jsx
import { WalletContext } from 'littlefish-boilerplate';
```
Wrap your app with the context provider:
```jsx
<WalletContext>
  <App />
</WalletContext>
```
### Configuration
For external APIs and environment variables, ensure to set them in your project:
```jsx
BLOCKFROST_API_KEY=your-api-key
```