const BASE_URL = "https://app.coreiot.io";
const DEVICE_ID = process.env.REACT_APP_DEVICE_ID;
const TOKEN = process.env.REACT_APP_TOKEN;
const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;
const TELEMETRY_KEYS = "temperature,humidity,mq_value,distance";

export async function fetchTelemetryData() {
  const url = `${BASE_URL}/api/plugins/telemetry/DEVICE/${DEVICE_ID}/values/timeseries?keys=${TELEMETRY_KEYS}`;
  const headers = { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" };
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return {
      temperature: data.temperature?.[0]?.value ?? null,
      humidity: data.humidity?.[0]?.value ?? null,
      coLevel: data.mq_value?.[0]?.value ?? null,
      distance: data.distance?.[0]?.value ?? null,
    };
  } catch (error) {
    console.error("Error fetching telemetry:", error);
    throw error;
  }
}

export async function fetchClientAttributes() {
  const url = `${BASE_URL}/api/plugins/telemetry/DEVICE/${DEVICE_ID}/values/attributes?scope=CLIENT_SCOPE`;
  const headers = { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" };
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    let ledState = false;
    let fanState = false;
    for (const attr of data) {
      if (attr.key === "ledState") ledState = attr.value;
      if (attr.key === "fanState") fanState = attr.value;
    }
    return { ledState, fanState };
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
}

export async function toggleLed(state) {
  const url = `${BASE_URL}/api/v1/${ACCESS_TOKEN}/attributes`;
  const headers = { "Content-Type": "application/json" };
  const payload = { ledState: state };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Body: ${errorBody}`);
    }
    console.log("LED toggle command sent successfully.");
  } catch (error) {
    console.error("Error controlling LED:", error);
    alert("Failed to control LED. State set to OFF. Check console for details.");
    throw error;
  }
}

export async function toggleFan(state) {
  const url = `${BASE_URL}/api/v1/${ACCESS_TOKEN}/attributes`;
  const headers = { "Content-Type": "application/json" };
  const payload = { fanState: state };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Body: ${errorBody}`);
    }
    console.log("Fan toggle command sent successfully.");
  } catch (error) {
    console.error("Error controlling Fan:", error);
    alert("Failed to control Fan. State set to OFF. Check console for details.");
    throw error;
  }
}

export async function toggleDoor(state) {
  const url = `${BASE_URL}/api/v1/${ACCESS_TOKEN}/attributes`;
  const headers = { "Content-Type": "application/json" };
  const payload = { doorState: state };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Body: ${errorBody}`);
    }
    console.log("Door toggle command sent successfully.");
  } catch (error) {
    console.error("Error controlling Door:", error);
    alert("Failed to control Door. Check console for details.");
    throw error;
  }
}

export const changePassword = async (currentPassword, newPassword) => {
  // Implement your API call to change password
  // This is a placeholder - replace with actual API endpoint
  try {
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to change password');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to change password');
  }
};