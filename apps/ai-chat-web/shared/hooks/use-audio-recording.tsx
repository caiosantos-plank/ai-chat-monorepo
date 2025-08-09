"use client";

import { useRef, useState } from "react";

const useAudioRecording = () => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);


    const getAudioStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            return stream;
        } catch (error) {
            console.error("Error getting audio stream", error);
            throw error;
        }
    }

    const startRecording = async () => {
        try {
            const stream = await getAudioStream();
            const mediaRecorder = new MediaRecorder(stream);

            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);
                console.log("Audio recorded", audioUrl);
            }

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorderRef.current.start();
            setIsRecording(true);
            console.log("Recording started");


            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(audioContext.destination);

            console.log("Microphone stream started");
        } catch (error) {
            console.error("Error starting recording", error);
            return null;
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach(track => track.stop());

            setIsRecording(false);
            console.log("Recording stopped");
        }
    }

    return { isRecording, startRecording, stopRecording };
}

export default useAudioRecording;