// test-embed-http.ts
import 'dotenv/config';
import fetch from 'node-fetch';

const KEY = process.env.GOOGLE_API_KEY;
if (!KEY) throw new Error('Missing GOOGLE_API_KEY in environment');

const BASE = 'https://generativelanguage.googleapis.com/v1beta2';

// Helper: exit on HTTP errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function check(res: any) {
    if (!res.ok) {
        const body = await res.text();
        console.error(`❌ HTTP ${res.status}:`, body);
        process.exit(1);
    }
    return res.json();
}

async function main() {
    console.log('🔍 Listing available models…');
    const list = await fetch(`${BASE}/models?key=${KEY}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listJson: any = await check(list);
    console.log('✅ Models available:',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (listJson.models as any[]).map(m => m.name).join(', ')
    );

    console.log('\n🔍 Testing embedding with embedding-gecko-001…');
    const embed = await fetch(
        `${BASE}/models/embedding-gecko-001:embed?key=${KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [
                    'What does the Bible say about forgiveness?'
                ]
            }),
        }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedJson: any = await check(embed);

    const dims = embedJson.embeddings?.[0]?.values;
    if (!Array.isArray(dims)) {
        console.error('❌ Unexpected embed response:', JSON.stringify(embedJson, null, 2));
        process.exit(1);
    }

    console.log('✅ Embedding OK. First 5 dims:', dims.slice(0, 5));
}

main().catch(err => {
    console.error('🔥 Fatal error:', err);
    process.exit(1);
});
