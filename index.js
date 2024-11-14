document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    const searchBar = document.getElementById('search-bar');
    const showAllBtn = document.getElementById('show-all-btn');
    const showCompletedBtn = document.getElementById('show-completed-btn');
    const showPendingBtn = document.getElementById('show-pending-btn');
    let tasks = loadTasksFromLocalStorage();

    // Load and display tasks on page load
    displayTasks(tasks);

    // Add Task
    addTaskBtn.addEventListener('click', () => {
        const taskName = taskInput.value.trim();
        if (taskName) {
            const task = {
                id: Date.now(),  // Unique ID based on timestamp
                name: taskName,
                completed: false
            };
            tasks.push(task);
            saveTasksToLocalStorage();
            displayTasks(tasks);
            taskInput.value = '';  // Clear input field
        }
    });

    // Search Filter
    searchBar.addEventListener('input', () => {
        const searchQuery = searchBar.value.toLowerCase();
        const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(searchQuery));
        displayTasks(filteredTasks);
    });

    // Show All Tasks
    showAllBtn.addEventListener('click', () => {
        displayTasks(tasks);
    });

    // Show Completed Tasks
    showCompletedBtn.addEventListener('click', () => {
        const completedTasks = tasks.filter(task => task.completed);
        displayTasks(completedTasks);
    });

    // Show Pending Tasks
    showPendingBtn.addEventListener('click', () => {
        const pendingTasks = tasks.filter(task => !task.completed);
        displayTasks(pendingTasks);
    });

    // Display tasks in the list
    function displayTasks(tasks) {
        taskList.innerHTML = '';  // Clear task list
        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-message">No tasks available.</li>';
        } else {
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.classList.toggle('completed', task.completed);
                li.setAttribute('data-id', task.id);
                li.innerHTML = `
                    <span class="task-name">${task.name}</span>
                    <div class="buttons">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                        <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                    </div>
                `;
                taskList.appendChild(li);

                // Edit Task
                li.querySelector('.edit-btn').addEventListener('click', () => {
                    const taskNameSpan = li.querySelector('.task-name');
                    const currentName = taskNameSpan.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentName;
                    taskNameSpan.replaceWith(input);

                    // Change to Save/Cancel options
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save';
                    saveBtn.addEventListener('click', () => {
                        const newName = input.value.trim();
                        if (newName) {
                            task.name = newName;
                            saveTasksToLocalStorage();
                            displayTasks(tasks);
                        }
                    });
                    li.querySelector('.buttons').appendChild(saveBtn);
                });

                // Delete Task
                li.querySelector('.delete-btn').addEventListener('click', () => {
                    tasks = tasks.filter(task => task.id !== Number(li.getAttribute('data-id')));
                    saveTasksToLocalStorage();
                    displayTasks(tasks);
                });

                // Complete/Undo Task
                li.querySelector('.complete-btn').addEventListener('click', () => {
                    task.completed = !task.completed;
                    saveTasksToLocalStorage();
                    displayTasks(tasks);
                });
            });
        }
    }

    // Save tasks to LocalStorage
    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from LocalStorage
    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    // Drag and Drop Reordering
    taskList.addEventListener('dragstart', (event) => {
        if (event.target.tagName === 'LI') {
            event.dataTransfer.setData('text/plain', event.target.getAttribute('data-id'));
        }
    });

    taskList.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    taskList.addEventListener('drop', (event) => {
        event.preventDefault();
    
        // Get the ID of the dragged task
        const draggedTaskId = event.dataTransfer.getData('text/plain');
        const draggedTaskIndex = tasks.findIndex(task => task.id === Number(draggedTaskId));
    
        // Get the target task where the dragged task is dropped
        const targetTaskId = event.target.closest('li').getAttribute('data-id');
        const targetTaskIndex = tasks.findIndex(task => task.id === Number(targetTaskId));
    
        // If the dragged task and the target task are not the same, reorder the array
        if (draggedTaskIndex !== targetTaskIndex) {
            // Remove the dragged task and insert it at the target index
            const [draggedTask] = tasks.splice(draggedTaskIndex, 1);
            tasks.splice(targetTaskIndex, 0, draggedTask);
    
            // Save the updated tasks order to local storage
            saveTasksToLocalStorage();
    
            // Re-render the task list with the updated order
            displayTasks(tasks);
        }
    });
});
