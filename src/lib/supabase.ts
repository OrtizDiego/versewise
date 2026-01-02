import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseKey) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Note: The `match_documents` function below is a sample PostgreSQL function
// that you would need to create in your Supabase database.
//
// CREATE OR REPLACE FUNCTION match_documents (
//   query_embedding vector(768),
//   match_threshold float,
//   match_count int
// )
// RETURNS TABLE (
//   id bigint,
//   content text,
//   file_name text,
//   similarity float
// )
// LANGUAGE sql STABLE
// AS $$
//   SELECT
//     documents.id,
//     documents.content,
//     documents.file_name,
//     1 - (documents.embedding <=> query_embedding) as similarity
//   FROM documents
//   WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
//   ORDER BY similarity DESC
//   LIMIT match_count;
// $$;

export const supabase = createClient(supabaseUrl, supabaseKey);
