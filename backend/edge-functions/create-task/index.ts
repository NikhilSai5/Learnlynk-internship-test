// LearnLynk Tech Test - Task 3: Edge Function create-task

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client setup from environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Define the expected payload and valid task types
type CreateTaskPayload = {
  application_id: string;
  task_type: "call" | "email" | "review";
  due_at: string;
  title?: string;
};

const VALID_TASK_TYPES = ["call", "email", "review"] as const;

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: defaultHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: defaultHeaders,
    });
  }

  try {
    const body = (await req.json()) as Partial<CreateTaskPayload>;
    const { application_id, task_type, due_at } = body;

    // 1. Validate input presence
    if (!application_id || !task_type || !due_at) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: application_id, task_type, due_at",
        }),
        {
          status: 400,
          headers: defaultHeaders,
        },
      );
    }

    // 2. Validate task_type
    if (!VALID_TASK_TYPES.includes(task_type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid task_type. Must be one of: ${VALID_TASK_TYPES.join(
            ", ",
          )}`,
        }),
        {
          status: 400,
          headers: defaultHeaders,
        },
      );
    }

    // 3. Validate due_at (must be a valid future date)
    const dueDate = new Date(due_at);
    const now = new Date();

    if (Number.isNaN(dueDate.getTime()) || dueDate <= now) {
      return new Response(
        JSON.stringify({
          error: "Invalid due_at. Must be a valid date in the future.",
        }),
        {
          status: 400,
          headers: defaultHeaders,
        },
      );
    }

    // 4. Get tenant_id from the application to ensure data segregation
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("tenant_id")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      console.error("Application lookup error:", appError);
      return new Response(JSON.stringify({ error: "Application not found." }), {
        status: 404,
        headers: defaultHeaders,
      });
    }

    // 5. Insert the new task into the database
    const taskPayload = {
      application_id: application_id, // CORRECTED: using application_id from schema
      type: task_type,
      due_at: dueDate.toISOString(),
      tenant_id: application.tenant_id,
      title: body.title || "Follow up on application",
      status: "open",
    };

    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert(taskPayload)
      .select("id") // CORRECTED: .select() should be part of the insert query
      .single();

    if (insertError || !task) {
      console.error("Supabase insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create task." }), {
        status: 500,
        headers: defaultHeaders,
      });
    }

    // 6. Emit a Realtime event as required
    // Multi-tenant broadcast channel for "task.created"
    const channel = supabase.channel(`public:tasks:tenant_id=eq.${application.tenant_id}`); // CORRECTED: multi-tenant channel
    await channel.send({
      type: "broadcast",
      event: "task.created",
      payload: {
        task_id: task.id,
        application_id,
        task_type,
        due_at: taskPayload.due_at,
        tenant_id: application.tenant_id,
      },
    });

    // 7. Return success response
    return new Response(JSON.stringify({ success: true, task_id: task.id }), {
      status: 200,
      headers: defaultHeaders,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    const isSyntaxError = err instanceof SyntaxError;
    return new Response(
      JSON.stringify({
        error: isSyntaxError ? "Invalid JSON body" : "Internal server error",
      }),
      {
        status: isSyntaxError ? 400 : 500,
        headers: defaultHeaders,
      },
    );
  }
});