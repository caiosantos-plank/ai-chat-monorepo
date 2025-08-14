"use client";

import { useRef, useState } from "react";

const useAudioRecording = () => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioRecording, setAudioRecording] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const getAudioStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 44100,
                    sampleSize: 16,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,

                }, video: false
            });
            return stream;
        } catch (error) {
            console.error("Error getting audio stream", error);
            throw error;
        }
    }

    const startRecording = async () => {
        try {
            setAudioRecording(null);
            const stream = await getAudioStream();
            const mediaRecorder = new MediaRecorder(stream);

            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);

                setAudioRecording(audioBlob);
                setAudioUrl(audioUrl);
            }

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorderRef.current.start();
            setIsRecording(true);

            const audioContext = new AudioContext();
            audioContext.createMediaStreamSource(stream);

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
        }
    }

    const clearAudioRecording = () => {
        setAudioRecording(null);
        setAudioUrl(null);
    }

    return { isRecording, audioRecording, audioUrl, startRecording, stopRecording, clearAudioRecording };
}

export default useAudioRecording;