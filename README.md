# TaskFlow — JavaScript Task Manager

A small, complete project built with HTML, CSS, and vanilla JavaScript. It is designed as a learning project: the code is separated into named sections and includes explanations of the important decisions.

## Run it

1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. Add a task, change its priority, complete it, search, filter, and delete it.
4. Refresh the page: tasks should remain because the app uses Local Storage.

No package installation or build tools are required.

## Features

- Add tasks with low, medium, or high priority
- Mark tasks complete or pending
- Delete a task
- Search tasks by title
- Filter All / Pending / Completed
- Task counts and remaining-task message
- Clear completed tasks
- Persist tasks in browser Local Storage

## Learn the code in this order

1. `index.html`: identify the form, inputs, buttons, and empty list.
2. `script.js` — section 1: `getElementById()` and `querySelectorAll()` select HTML elements.
3. Section 2: `tasks` is an array of task objects; `activeFilter` and `searchTerm` are state.
4. Section 3: `loadTasks()`, `saveTasks()`, `JSON.parse()`, `JSON.stringify()`, and Local Storage.
5. Section 4: form submit event, `preventDefault()`, validation, object creation, and spread syntax.
6. Section 5: `map()` updates a task; `filter()` removes tasks; callbacks run for each array item.
7. Section 6: input and click events, `forEach()`, `dataset`, `includes()`, and filter conditions.
8. Section 7: DOM creation with `createElement()`, `textContent`, `append()`, and rendering from data.
9. Section 8: `setTimeout()` and its callback.
10. Final line: the first render when the page loads.

## A few important design ideas

- **State:** the `tasks` array is the app's source of truth.
- **Render:** `renderTasks()` reads state and rebuilds the visible list.
- **Events:** event listeners react to the user's actions and update state.
- **Persistence:** `saveTasks()` saves state after changes.
- **Non-mutating updates:** `map()`, `filter()`, and spread syntax create new arrays/objects for several updates.
- **Safe text display:** task titles are inserted with `textContent`, not by interpreting user input as HTML.

## Concepts deliberately not forced into this version

The project focuses on concepts that naturally fit this app. It does not need Fetch API, Promises, `async/await`, or ES modules yet. We can add an API-powered feature later to practise asynchronous JavaScript, and split the code into modules once the current flow is clear.
