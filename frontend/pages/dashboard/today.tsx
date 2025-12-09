import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

// Define the Task type based on the schema
type Task = {
  id: string;
  title: string;
  type: string;
  status: string;
  application_id: string;
  due_at: string;
};

// Function to fetch tasks due today and that are not completed
async function fetchTasksDueToday(): Promise<Task[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, type, status, application_id, due_at")
    .gte("due_at", startOfDay)
    .lte("due_at", endOfDay)
    .not("status", "eq", "completed")
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Task[];
}

// Function to update a task's status
async function updateTaskStatus({ id, status }: { id: string; status: string }): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export default function TodayDashboard() {
  const queryClient = useQueryClient();

  // Fetch tasks using useQuery
  const { data: tasks, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['todayTasks'],
    queryFn: fetchTasksDueToday,
  });

  // Mutation for marking a task as complete
  const { mutate: markComplete, isPending: isUpdating } = useMutation({
    mutationFn: (taskId: string) => updateTaskStatus({ id: taskId, status: 'completed' }),
    onSuccess: () => {
      // Invalidate and refetch the tasks query to get fresh data
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
    },
    onError: (err: Error) => {
      alert(`Failed to update task: ${err.message}`);
    }
  });

  if (isLoading) return <div style={{ padding: "1.5rem" }}>Loading tasks...</div>;
  if (isError) return <div style={{ padding: "1.rem", color: "red" }}>Error: {error.message}</div>;

  return (
    <main style={{ padding: "1.5rem", fontFamily: "sans-serif" }}>
      <h1>Today&apos;s Tasks</h1>
      {!tasks || tasks.length === 0 ? (
        <p>No tasks due today 🎉</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Title</th>
              <th style={tableHeaderStyle}>Type</th>
              <th style={tableHeaderStyle}>Application ID</th>
              <th style={tableHeaderStyle}>Due At</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={tableRowStyle}>
                <td style={tableCellStyle}>{task.title}</td>
                <td style={tableCellStyle}>{task.type}</td>
                <td style={tableCellStyle}>{task.application_id}</td>
                <td style={tableCellStyle}>{new Date(task.due_at).toLocaleTimeString()}</td>
                <td style={tableCellStyle}>{task.status}</td>
                <td style={tableCellStyle}>
                  {task.status !== "completed" && (
                    <button onClick={() => markComplete(task.id)} disabled={isUpdating}>
                      {isUpdating ? 'Completing...' : 'Mark Complete'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

// Basic styling for the table
const tableHeaderStyle = {
  textAlign: 'left' as const,
  padding: '8px',
  borderBottom: '2px solid #ddd',
};

const tableRowStyle = {
  borderBottom: '1px solid #ddd',
};

const tableCellStyle = {
  padding: '8px',
};