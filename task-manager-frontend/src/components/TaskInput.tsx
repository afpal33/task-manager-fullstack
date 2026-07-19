type TaskInputProps = {
    text: string;
    setText: (text: string) => void;
    description: string;
    setDescription: (description: string) => void;
    tags: string;
    setTags: (tags: string) => void;
}

export const TaskInput = ({ text, setText, description, setDescription, tags, setTags }: TaskInputProps) => (
    <div className="flex flex-col gap-4">
        <label htmlFor="task-title" className="sr-only">Nueva tarea</label>
        <input
            id="task-title"
            aria-label="Nueva tarea"
            type="text"
            value={text}
            onChange={ (e) => setText(e.target.value)}
            placeholder="Escribe el nombre de la tarea..."
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
        <input
            type="text"
            value={description}
            onChange={ (e) => setDescription(e.target.value)}
            placeholder="Una breve descripción... (opcional)"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
        <input
            type="text"
            value={tags}
            onChange={ (e) => setTags(e.target.value)}
            placeholder="Etiquetas (separadas por comas)..."
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
    </div>
)

export default TaskInput;