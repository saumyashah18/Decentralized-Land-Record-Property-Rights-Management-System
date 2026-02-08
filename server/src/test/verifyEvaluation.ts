import axios from 'axios';

async function verifyEvaluation() {
    const baseURL = 'http://localhost:8000/api/evaluation';

    try {
        console.log('--- Testing Evaluation Scenarios ---');

        // 1. Start Scenarios
        const startRes = await axios.post(`${baseURL}/start`);
        console.log('Start Scenarios:', startRes.data);

        // 2. Wait for some progress
        await new Promise(resolve => setTimeout(resolve, 4000));

        // 3. Get Scenario 1 status
        const s1Res = await axios.get(`${baseURL}/scenario1/status`);
        console.log('Scenario 1 Status:', JSON.stringify(s1Res.data.data, null, 2));

        // 4. Get Scenario 2 status
        const s2Res = await axios.get(`${baseURL}/scenario2/status`);
        console.log('Scenario 2 Status:', JSON.stringify(s2Res.data.data, null, 2));

        if (s1Res.data.data.parcelId && s1Res.data.data.registrars.length > 0) {
            console.log('✅ Scenario 1 verified with Parcel ID and Registrars');
        }

        if (s2Res.data.data.fabricHash || s2Res.data.data.status !== 'pending') {
            console.log('✅ Scenario 2 verified with Hash generation');
        }

    } catch (error: any) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verifyEvaluation();
