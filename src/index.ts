/**
 * This file contains TypeScript definitions for the Web Platform's Language Model API.
 * These types are based on the official documentation and are intended to provide
 * compile-time checking and IntelliSense for developers using this experimental API.
 *
 * @see https://developer.chrome.com/docs/ai/prompt-api
 */

import { JSONSchema7 } from "json-schema";

/**
 * Represents the availability of the language model.
 * - `unavailable`: The model is not available and cannot be used.
 * - `downloadable`: The model is available for download.
 * - `downloading`: The model is currently being downloaded.
 * - `available`: The model is downloaded and ready to use.
 */
export type LanguageModelAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

/**
 * Defines the role of the author of a prompt message.
 * - `user`: The user asking a question or giving an instruction.
 * - `assistant`: The language model providing a response.
 * - `system`: A message that provides system-level instructions or context.
 */
export type LanguageModelRole = "user" | "assistant" | "system";

/**
 * A part of a prompt that contains text.
 */
export interface TextPart {
  type: "text";
  value: string;
}

/**
 * A part of a prompt that contains an image.
 */
export interface ImagePart {
  type: "image";
  value: Blob;
}

/**
 * A part of a prompt that contains audio.
 */
export interface AudioPart {
  type: "audio";
  value: Blob;
}

/**
 * Represents a part of a multimodal prompt, which can be text, an image, or audio.
 */
export type LanguageModelContentPart = TextPart | ImagePart | AudioPart;

/**
 * Represents a single message in a conversation history, including its role and content.
 */
export interface Prompt {
  /** The role of the author of this message. */
  role: LanguageModelRole;

  /** The content of the message, which can be a simple string or an array of content parts for multimodal input. */
  content: string | LanguageModelContentPart[];

  /** If true, the model should treat this as a prefix to its response, rather than a complete message. */
  prefix?: boolean;
}

/**
 * Contains information about the model's parameters.
 */
export interface LanguageModelParams {
  /** The default top-K value for sampling. */
  defaultTopK: number;

  /** The maximum top-K value. */
  maxTopK: number;

  /** The default temperature for sampling. */
  defaultTemperature: number;

  /** The maximum temperature value. */
  maxTemperature: number;
}

/**
 * Specifies the expected types of input for a language model session.
 */
export interface ExpectedInput {
  type: "audio" | "image" | "text";
}

/**
 * Represents the progress of a model download.
 */
export interface DownloadProgressEvent {
  /** The number of bytes downloaded so far. */
  loaded: number;
}

/**
 * A callback function to monitor the download progress of the language model.
 */
export type LanguageModelDownloadMonitor = (monitor: {
  addEventListener: (
    event: "downloadprogress",
    listener: (e: DownloadProgressEvent) => void
  ) => void;
}) => void;

/**
 * Options for creating a new language model session.
 */
export interface LanguageModelCreateOptions {
  /** A function to monitor download progress. */
  monitor?: LanguageModelDownloadMonitor;

  /** An AbortSignal to cancel the session creation. */
  signal?: AbortSignal;

  /** A set of initial prompts to provide context to the model. */
  initialPrompts?: Prompt[];

  /** The expected types of input for the session. */
  expectedInputs?: ExpectedInput[];

  /** The temperature for sampling, controlling the randomness of the output. */
  temperature?: number;

  /** The top-K value for sampling, limiting the vocabulary for the next token. */
  topK?: number;
}

/**
 * Options for a prompt request.
 */
export interface PromptOptions {
  /** An AbortSignal to cancel the prompt request. */
  signal?: AbortSignal;

  /** A JSON schema to constrain the model's output. */
  responseConstraint?: JSONSchema7;

  /** If true, the response constraint will not be included in the input to the model. */
  omitResponseConstraintInput?: boolean;
}

/**
 * Represents a conversation session with the language model.
 */
export interface LanguageModelSession {
  /**
   * Sends a prompt to the model and returns the response as a single string.
   * @param prompt The prompt to send, either as a string or an array of `Prompt` objects.
   * @param options Additional options for the prompt.
   * @returns A promise that resolves to the model's response.
   */
  prompt(prompt: string | Prompt[], options?: PromptOptions): Promise<string>;

  /**
   * Sends a prompt to the model and returns the response as a stream of strings.
   * @param prompt The prompt to send, either as a string or an array of `Prompt` objects.
   * @param options Additional options for the prompt.
   * @returns A `ReadableStream` that yields chunks of the model's response.
   */
  promptStreaming(
    prompt: string | Prompt[],
    options?: PromptOptions
  ): ReadableStream<string>;

  /**
   * Appends a set of prompts to the session's history without generating a response.
   * @param prompts The prompts to append.
   * @returns A promise that resolves when the prompts have been appended.
   */
  append(prompts: Prompt[]): Promise<void>;

  /**
   * Creates a new session with the same initial context but a cleared conversation history.
   * @param options Options for cloning the session, including an `AbortSignal`.
   * @returns A promise that resolves to the new `LanguageModelSession`.
   */
  clone(options?: { signal?: AbortSignal }): Promise<LanguageModelSession>;

  /**
   * Terminates the session and releases any associated resources.
   */
  destroy(): void;

  /**
   * Measures the number of tokens the given prompt would consume.
   * @param prompt The prompt to measure.
   * @param options Options for measuring, such as a response constraint.
   * @returns A promise that resolves to an object containing the token usage.
   */
  measureInputUsage(
    prompt: string | Prompt[],
    options?: { responseConstraint?: JSONSchema7 }
  ): Promise<{ usage: number }>;

  /** The number of tokens used in the session's input so far. */
  readonly inputUsage: number;

  /** The maximum number of tokens allowed in the session's input. */
  readonly inputQuota: number;
}

/**
 * The main interface for the Language Model API, providing access to model information and session creation.
 */
export interface LanguageModel {
  /**
   * Checks the availability of the language model.
   * @returns A promise that resolves to the `LanguageModelAvailability` status.
   */
  availability(): Promise<LanguageModelAvailability>;

  /**
   * Creates a new language model session.
   * @param options Options for creating the session.
   * @returns A promise that resolves to a `LanguageModelSession` object.
   */
  create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;

  /**
   * Retrieves the parameters of the language model.
   * @returns A promise that resolves to a `LanguageModelParams` object.
   */
  params(): Promise<LanguageModelParams>;
}

declare global {
  /**
   * The global `LanguageModel` object, providing access to the API.
   */
  const LanguageModel: LanguageModel;
}
