document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.querySelector('.tasks-container');
    const emptyState = document.querySelector('.empty-state');
    const priorityDots = document.querySelectorAll('.priority-dot');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortBtn = document.querySelector('.sort-btn');
    const sortMenu = document.querySelector('.sort-menu');
    const sortOptions = document.querySelectorAll('.sort-menu a');
    const tasksCountEl = document.querySelector('.tasks-count');
    const clearCompletedBtn = document.querySelector('.clear-completed-btn');
    const themeToggle = document.querySelector('.theme-toggle');

    // App State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let selectedPriority = 'medium';
    let currentFilter = 'all';
    let currentSort = 'date';
    let darkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize App
    initApp();

    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    
    priorityDots.forEach(dot => {
        dot.addEventListener('click', () => {
            priorityDots.forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            selectedPriority = dot.dataset.priority;
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    sortBtn.addEventListener('click', () => {
        sortMenu.classList.toggle('show');
    });

    sortOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            currentSort = option.dataset.sort;
            sortMenu.classList.remove('show');
            sortTasks();
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    themeToggle.addEventListener('click', toggleTheme);

    // Close sort menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sort-dropdown')) {
            sortMenu.classList.remove('show');
        }
    });

    // Functions
    function initApp() {
        // Select medium priority by default
        document.querySelector('.priority-dot[data-priority="medium"]').classList.add('selected');
        
        // Set theme
        if (darkMode) {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
        
        renderTasks();
    }

    function addTask(e) {
        e.preventDefault();
        
        const taskText = taskInput.value.trim();
        if (!taskText) return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: selectedPriority,
            createdAt: new Date()
        };
        
        tasks.unshift(newTask);
        saveTasksToLocalStorage();
        taskInput.value = '';
        
        renderTasks();
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToLocalStorage();
        renderTasks();
    }

    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        saveTasksToLocalStorage();
        renderTasks();
    }

    function editTask(taskId, newText) {
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, text: newText } : task
        );
        saveTasksToLocalStorage();
        renderTasks();
    }

    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasksToLocalStorage();
        renderTasks();
    }

    function toggleTheme() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-theme', darkMode);
        localStorage.setItem('darkMode', darkMode);
        
        const icon = themeToggle.querySelector('i');
        if (darkMode) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    function filterTasks() {
        switch (currentFilter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }

    function sortTasks() {
        switch (currentSort) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'alphabetical':
                tasks.sort((a, b) => a.text.localeCompare(b.text));
                break;
            default:
                // Already sorted by date (newest first) by default
                break;
        }
        saveTasksToLocalStorage();
    }

    function renderTasks() {
        const filteredTasks = filterTasks();
        
        // Update tasks count
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksCountEl.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''}`;
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex';
            if (tasks.length > 0) {
                // We have tasks but none match the filter
                emptyState.querySelector('p').textContent = 'No tasks match your filter';
                emptyState.querySelector('.empty-state-subtitle').textContent = 'Try changing your filter options';
            } else {
                // We have no tasks at all
                emptyState.querySelector('p').textContent = 'You have no tasks yet';
                emptyState.querySelector('.empty-state-subtitle').textContent = 'Add a new task to get started!';
            }
        } else {
            emptyState.style.display = 'none';
        }
        
        // Remove existing task elements except empty state
        const taskElements = tasksContainer.querySelectorAll('.task-item');
        taskElements.forEach(el => el.remove());
        
        // Create and append new task elements
        filteredTasks.forEach(task => {
            const taskEl = createTaskElement(task);
            tasksContainer.insertBefore(taskEl, emptyState);
        });
        
        setupDragAndDrop();
    }

    function createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item priority-${task.priority}`;
        taskEl.dataset.id = task.id;
        if (task.completed) taskEl.classList.add('completed');
        
        taskEl.innerHTML = `
            <div class="task-content">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="task-${task.id}"></label>
                </div>
                <span class="task-text">${task.text}</span>
                <div class="priority-indicator"></div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" aria-label="Edit task">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="delete-btn" aria-label="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="drag-handle" aria-label="Drag to reorder">
                    <i class="fas fa-grip-lines"></i>
                </div>
            </div>
        `;
        
        // Add event listeners to the task element
        taskEl.querySelector('input[type="checkbox"]').addEventListener('change', () => {
            toggleTaskCompletion(task.id);
        });
        
        taskEl.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id);
        });
        
        taskEl.querySelector('.edit-btn').addEventListener('click', () => {
            const taskTextEl = taskEl.querySelector('.task-text');
            const currentText = taskTextEl.textContent;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-input';
            input.value = currentText;
            
            taskTextEl.replaceWith(input);
            input.focus();
            
            function saveEdit() {
                const newText = input.value.trim();
                if (newText && newText !== currentText) {
                    editTask(task.id, newText);
                } else {
                    // If empty or unchanged, revert back
                    input.replaceWith(taskTextEl);
                }
            }
            
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                } else if (e.key === 'Escape') {
                    input.replaceWith(taskTextEl);
                }
            });
        });
        
        // Double-click to edit
        taskEl.querySelector('.task-text').addEventListener('dblclick', () => {
            taskEl.querySelector('.edit-btn').click();
        });
        
        return taskEl;
    }

    function setupDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            item.setAttribute('draggable', true);
            
            item.addEventListener('dragstart', () => {
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                
                // Update tasks array based on new order
                const newOrder = [];
                document.querySelectorAll('.task-item').forEach(taskEl => {
                    const taskId = parseInt(taskEl.dataset.id);
                    const task = tasks.find(t => t.id === taskId);
                    if (task) newOrder.push(task);
                });
                
                tasks = newOrder;
                saveTasksToLocalStorage();
            });
        });
        
        tasksContainer.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;
            
            const siblings = [...tasksContainer.querySelectorAll('.task-item:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
            });
            
            if (nextSibling) {
                tasksContainer.insertBefore(draggingItem, nextSibling);
            } else {
                tasksContainer.appendChild(draggingItem);
            }
        });
    }

    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});