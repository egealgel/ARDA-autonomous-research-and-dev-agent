import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TasksListPage } from "@/pages/TasksListPage";
import { NewTaskPage } from "@/pages/NewTaskPage";
import { TaskDetailPage } from "@/pages/TaskDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksListPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="new" element={<NewTaskPage />} />
      </Route>
    </Routes>
  );
}

export default App;
