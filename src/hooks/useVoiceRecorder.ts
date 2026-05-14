"use client";

import { useCallback, useRef, useState } from "react";

interface UseVoiceRecorderProps {
    onAudioReady: (base64Message: string) => Promise<void>;
    onError: (message: string) => void;
}

export function useVoiceRecorder({ onAudioReady, onError }: UseVoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64AudioMessage = `[VOICE]:${reader.result}`;
                    if (base64AudioMessage.length > 1_000_000) {
                        onError("Voice message too large (limit ~1MB). Please record a shorter message.");
                        return;
                    }
                    await onAudioReady(base64AudioMessage);
                };
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch {
            onError("Microphone access denied or unavailable.");
        }
    }, [onAudioReady, onError]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
    }, [isRecording]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = () => {
                mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setRecordingDuration(0);
        }
    }, [isRecording]);

    const formatDuration = useCallback((seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }, []);

    const cleanup = useCallback(() => {
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        }
    }, []);

    return { isRecording, recordingDuration, startRecording, stopRecording, cancelRecording, formatDuration, cleanup };
}
