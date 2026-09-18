const testScanUpload = async () => {
  try {
    // 1. Authenticate & obtain token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@neurovision.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Login Auth Token obtained successfully:', token ? 'YES' : 'NO');

    // 2. Send POST /api/scans upload request
    const scanPayload = {
      patientId: 'PT-8838-B',
      modality: 'T1 Contrast-Enhanced',
      source: 'Custom Upload',
      fileUrl: 'Y9.jpg',
      tumorType: 'Low-Grade Glioma',
      volume: 6.3,
      confidence: 94.41,
      riskScore: 'Low'
    };

    const scanRes = await fetch('http://localhost:5000/api/scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(scanPayload)
    });

    console.log('HTTP RESPONSE STATUS CODE:', scanRes.status);
    const responseJson = await scanRes.json();
    console.log('SCAN CREATION RESPONSE:', JSON.stringify(responseJson, null, 2));
  } catch (err) {
    console.error('TEST SCAN UPLOAD ERROR:', err);
  }
};

testScanUpload();
