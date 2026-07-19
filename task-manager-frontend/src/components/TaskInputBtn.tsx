type TaskInputBtnProps = {
    addTask: () => void;
}

export const TaskInputBtn = ({ addTask } : TaskInputBtnProps) => (
    <button
        onClick={addTask}
        className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-zinc-950 shadow-lg transition hover:scale-[1.02] hover:bg-cyan-400"
    >
        Agregar Tarea
    </button>
);

export default TaskInputBtn;
