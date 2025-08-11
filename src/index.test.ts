/**
 * This test suite is designed to ensure that the TypeScript definitions for the
 * LanguageModel API align with the official document  it('should handle response constraints', async () => {
    const session = await LanguageModel.create();
    const schema: JSONSchema7 = { type: 'boolean' };
    const result = await session.prompt('Is this a test?', {
      responseConstraint: schema,
    });
    expect(typeof result).toBe('string');
  });t does not exercise
 * the actual LanguageModel API, but rather uses stubs and mocks to verify that
 * the types support the documented method calls and data structures.
 */

import { JSONSchema7 } from "json-schema";
import {
  LanguageModel,
  LanguageModelSession,
  LanguageModelCreateOptions,
  Prompt,
} from "./index";

// Mock implementation of Blob for Node.js environment
class MockBlob {
  constructor(
    private parts: (string | Blob | Buffer)[],
    private options?: { type?: string }
  ) {}
  get type(): string {
    return this.options?.type ?? "";
  }
}
global.Blob = MockBlob as any;

// Stubs for the LanguageModel API
const mockSession: LanguageModelSession = {
  prompt: jest.fn().mockResolvedValue("Mocked response"),
  promptStreaming: jest.fn().mockReturnValue(
    new ReadableStream({
      start(controller) {
        controller.enqueue("Mocked ");
        controller.enqueue("streaming ");
        controller.enqueue("response");
        controller.close();
      },
    })
  ),
  append: jest.fn().mockResolvedValue(undefined),
  clone: jest.fn().mockResolvedValue(Promise.resolve(this)),
  destroy: jest.fn(),
  measureInputUsage: jest.fn().mockResolvedValue({ usage: 10 }),
  get inputUsage() {
    return 10;
  },
  get inputQuota() {
    return 100;
  },
  temperature: 0.8,
  topK: 5,
};

const mockLanguageModel: LanguageModel = {
  availability: jest.fn().mockResolvedValue("available"),
  create: jest.fn().mockResolvedValue(mockSession),
  params: jest.fn().mockResolvedValue({
    defaultTopK: 3,
    maxTopK: 8,
    defaultTemperature: 1.0,
    maxTemperature: 2.0,
  }),
};

// Assign the stub to a global variable to mimic the browser environment
(global as any).LanguageModel = mockLanguageModel;

describe("LanguageModel API Type Tests", () => {
  it("should allow checking model availability", async () => {
    const availability = await LanguageModel.availability();
    expect(typeof availability).toBe("string");
  });

  it("should allow checking model availability with options", async () => {
    const options: LanguageModelCreateOptions = {
      temperature: 0.8,
      topK: 5,
    };
    const availability = await LanguageModel.availability(options);
    expect(typeof availability).toBe("string");
  });

  it("should allow creating a session", async () => {
    const session = await LanguageModel.create();
    expect(session).toBeDefined();
  });

  it("should allow creating a session with options", async () => {
    const options: LanguageModelCreateOptions = {
      temperature: 0.8,
      topK: 5,
      initialPrompts: [
        { role: "system", content: "You are a helpful assistant." },
      ],
      signal: new AbortController().signal,
    };
    const session = await LanguageModel.create(options);
    expect(session).toBeDefined();
  });

  it("should allow prompting the model", async () => {
    const session = await LanguageModel.create();
    const result = await session.prompt("Hello, world!");
    expect(typeof result).toBe("string");
  });

  it("should allow prompting with an array of prompts", async () => {
    const session = await LanguageModel.create();
    const prompts: Prompt[] = [
      { role: "user", content: "What is the capital of France?" },
    ];
    const result = await session.prompt(prompts);
    expect(typeof result).toBe("string");
  });

  it("should allow streaming a response", async () => {
    const session = await LanguageModel.create();
    const stream = session.promptStreaming("Tell me a story.");
    expect(stream).toBeInstanceOf(ReadableStream);
    const reader = stream.getReader();
    let chunk = await reader.read();
    let content = "";
    while (!chunk.done) {
      content += chunk.value;
      chunk = await reader.read();
    }
    expect(typeof content).toBe("string");
  });

  it("should handle multimodal prompts", async () => {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }, { type: "audio" }],
    });
    const imageBlob = new Blob([], { type: "image/png" });
    const audioBlob = new Blob([], { type: "audio/webm" });
    const result = await session.prompt([
      {
        role: "user",
        content: [
          { type: "text", value: "Describe this image and audio." },
          { type: "image", value: imageBlob },
          { type: "audio", value: audioBlob },
        ],
      },
    ]);
    expect(typeof result).toBe("string");
  });

  it("should handle response constraints", async () => {
    const session = await LanguageModel.create();
    const schema: JSONSchema7 = { type: "boolean" };
    const result = await session.prompt("Is this a test?", {
      responseConstraint: schema,
    });
    expect(typeof result).toBe("string");
  });

  it("should allow cloning a session", async () => {
    const session = await LanguageModel.create();
    const clonedSession = await session.clone();
    expect(clonedSession).toBeDefined();
  });

  it("should allow destroying a session", async () => {
    const session = await LanguageModel.create();
    expect(() => session.destroy()).not.toThrow();
  });

  it("should have readonly temperature and topK on session", async () => {
    const session = await LanguageModel.create();
    expect(typeof session.temperature).toBe("number");
    expect(typeof session.topK).toBe("number");
  });
});
