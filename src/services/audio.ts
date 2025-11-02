let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startRecording = async (): Promise<void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
  } catch (error) {
    console.error('Error starting recording:', error);
    throw new Error('فشل بدء التسجيل. تأكد من صلاحيات الميكروفون.');
  }
};

export const stopRecording = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('لا يوجد تسجيل نشط'));
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        
        // Stop all tracks
        mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        mediaRecorder = null;
        audioChunks = [];
        
        resolve(base64Audio);
      };
      
      reader.onerror = () => {
        reject(new Error('فشل حفظ التسجيل'));
      };
      
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.stop();
  });
};

export const isRecording = (): boolean => {
  return mediaRecorder !== null && mediaRecorder.state === 'recording';
};
