// Helper para chamar Supabase Edge Functions
// URL pattern: https://{project-id}.supabase.co/functions/v1/{function-name}

function getEdgeFunctionURL(functionName: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada');
  }

  // Extract project ID from URL: https://xxx.supabase.co → xxx
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match || !match[1]) {
    throw new Error('URL do Supabase inválida');
  }

  const projectId = match[1];
  return `https://${projectId}.supabase.co/functions/v1/${functionName}`;
}

export { getEdgeFunctionURL };
