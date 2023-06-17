document.addEventListener("DOMContentLoaded", function() {
    const taskList = document.getElementById("task-list");
    const addTaskForm = document.getElementById("add-task-form");
    const taskInput = document.getElementById("task-input");

    addTaskForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText !== "") {
            const newTask = createTaskElement(taskText);
            taskList.appendChild(newTask);
            taskInput.value = "";
        }
    });

    taskList.addEventListener("click", function(event) {
        const taskItem = event.target.closest(".task");
        if (taskItem) {
            taskItem.classList.toggle("strikethrough");
        }
    });

    function createTaskElement(taskText) {
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const taskTextElement = document.createElement("span");
        taskTextElement.textContent = taskText;
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskTextElement);
        return taskItem;
    }
});
