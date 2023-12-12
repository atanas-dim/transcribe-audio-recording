"use client";
import { Predictions } from "@aws-amplify/predictions";
import mic from "microphone-stream";
import { useState } from "react";

function SpeechToText() {
  const [response, setResponse] = useState(
    "Record audio to generate a transcription."
  );

  function AudioRecorder({ finishRecording }) {
    const [recording, setRecording] = useState(false);
    const [micStream, setMicStream] = useState<any>();
    const [audioBuffer] = useState(
      (function () {
        let buffer = [];
        function add(raw) {
          buffer = buffer.concat(...raw);
          return buffer;
        }
        function newBuffer() {
          console.log("resetting buffer");
          buffer = [];
        }

        return {
          reset: function () {
            newBuffer();
          },
          addData: function (raw) {
            add(raw);
          },
          getData: function () {
            return buffer;
          },
        };
      })()
    );

    const startRecording = async () => {
      console.log("start recording");
      audioBuffer.reset();

      const startMic = new mic();
      startMic.setStream(
        await window.navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })
      );

      startMic.on("data", (chunk) => {
        var raw = mic.toRaw(chunk);
        if (raw == null) {
          return;
        }
        audioBuffer.addData(raw);
      });

      setRecording(true);
      setMicStream(startMic);
    };

    async function stopRecording() {
      console.log("stop recording");

      micStream.stop();
      setMicStream(null);
      setRecording(false);

      const resultBuffer = audioBuffer.getData();
      finishRecording(resultBuffer);
    }

    return (
      <div>
        <div>
          {recording && <button onClick={stopRecording}>Stop recording</button>}
          {!recording && (
            <button onClick={startRecording}>Start recording</button>
          )}
        </div>
      </div>
    );
  }

  const convertFromBuffer = async (bytes) => {
    console.log({ bytes });
    setResponse("Converting text...");

    try {
      const result = await Predictions.convert({
        transcription: {
          source: {
            bytes,
          },
          language: "en-US", // other options include 'en-GB', 'fr-FR', 'fr-CA', 'es-US'
        },
      });
      console.log({ result });
      setResponse(result.transcription.fullText);
    } catch (err) {
      setResponse(JSON.stringify(err, null, 2));
    }
  };

  return (
    <div>
      <div>
        <h3>Speech to text</h3>
        <AudioRecorder finishRecording={convertFromBuffer} />
        <p>{response}</p>
      </div>
    </div>
  );
}

export default SpeechToText;
