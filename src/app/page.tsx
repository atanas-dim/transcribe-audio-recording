"use client";

import SpeechToText from "@/components/speechToText/SpeechToText";

import { Amplify } from "aws-amplify";

import config from "@/amplifyconfiguration.json";

Amplify.configure(config, {
  ssr: true, // required when using Amplify with Next.js
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Audio Transcription App</h1>

      <SpeechToText />
    </main>
  );
}
