# LanguageModel-Types

This package provides TypeScript definitions for the experimental Web Platform's Language Model API, specifically the Prompt API. These types help you write safer code with better editor support when using this new browser feature.

## Installation

You can install this package using npm:

```bash
npm install @andyvanee/languagemodel-types
```

## Usage

Once installed, you can use the types in your TypeScript project. For example, you can create a function that interacts with the Language Model API and uses the types from this package to ensure type safety.

```typescript
import {
  LanguageModel,
  LanguageModelSession,
} from "@andyvanee/languagemodel-types";

async function getResponse(prompt: string): Promise<string | null> {
  if ((await LanguageModel.availability()) === "available") {
    const session: LanguageModelSession = await LanguageModel.create();
    return session.prompt(prompt);
  }
  return null;
}

// Example usage:
getResponse("What's the capital of France?").then((response) => {
  if (response) {
    console.log(response);
  } else {
    console.log("Language model not available.");
  }
});
```

The main entry point for the API is the global `LanguageModel` object. This package provides a global declaration for it, so you can use it directly in your code.

## Documentation

For more detailed information about the Language Model API and its capabilities, please refer to the official documentation:

[Chrome for Developers: Prompt API](https://developer.chrome.com/docs/ai/prompt-api)

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
