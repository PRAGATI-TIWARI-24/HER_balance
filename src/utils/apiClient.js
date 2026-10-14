const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const predictPCODRisk = async (formData, onWaitingWakeup) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 65000); // 65 sec limit

  // 4 second se zyada time lage toh UI ko notify karein ki server wake-up ho raha hai
  const slowTimer = setTimeout(() => {
    if (onWaitingWakeup) onWaitingWakeup(true);
  }, 4000);

  try {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: controller.signal,
    });

    clearTimeout(slowTimer);
    clearTimeout(timeoutId);
    if (onWaitingWakeup) onWaitingWakeup(false);

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(slowTimer);
    clearTimeout(timeoutId);
    if (onWaitingWakeup) onWaitingWakeup(false);

    if (error.name === 'AbortError') {
      throw new Error('Server starting hone mein zyada time le raha hai, kripya 10 second baad dobara koshish karein.');
    }
    throw error;
  }
};