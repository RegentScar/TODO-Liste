document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente abrufen
    const todoForm = document.getElementById('todoForm');
    const todoIdInput = document.getElementById('todoId');
    const titleInput = document.getElementById('title');
    const isEventInput = document.getElementById('isEvent');
    const descriptionInput = document.getElementById('description');
    const authorInput = document.getElementById('author');
    const categoryInput = document.getElementById('category');
    const isImportantInput = document.getElementById('isImportant');
    const isUrgentInput = document.getElementById('isUrgent');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const percentageInput = document.getElementById('percentage');
    const addBtn = document.getElementById('addBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const searchInput = document.getElementById('searchInput');
    const todoList = document.getElementById('todoList');

    // Initialisiere TODOS aus dem LocalStorage oder als leeres Array
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Funktion zur Berechnung der Priorität
    function calculatePriority(isImportant, isUrgent) {
        if (isImportant && isUrgent) return "Sofort erledigen";
        if (isImportant && !isUrgent) return "Einplanen und Wohlfühlen";
        if (!isImportant && isUrgent) return "Gib es ab";
        if (!isImportant && !isUrgent) return "Weg damit";
        return "Unbestimmt"; // Fallback
    }

    // Funktion zur CSS-Klasse basierend auf Priorität
    function getPriorityClass(priorityText) {
        if (priorityText === "Sofort erledigen") return "priority-sofort";
        if (priorityText === "Einplanen und Wohlfühlen") return "priority-einplanen";
        if (priorityText === "Gib es ab") return "priority-abgeben";
        if (priorityText === "Weg damit") return "priority-weg";
        return "";
    }


    // Funktion zum Rendern der TODOs in der Liste
    function renderTodos(filteredTodos = todos) {
        todoList.innerHTML = ''; // Liste leeren

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li>Keine TODOs gefunden.</li>';
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            const priorityText = calculatePriority(todo.isImportant, todo.isUrgent);
            li.className = getPriorityClass(priorityText); // CSS-Klasse für Priorität setzen

            li.innerHTML = `
                <h3>${todo.title} (${todo.isEvent ? 'Event' : 'Task'})</h3>
                <p><strong>Beschreibung:</strong> ${todo.description}</p>
                <p class="meta">Autor: ${todo.author} | Kategorie: ${todo.category}</p>
                <p class="meta">Priorität: <strong>${priorityText}</strong></p>
                <p class="meta">Start: ${new Date(todo.startDate).toLocaleDateString()} | Ende: ${new Date(todo.endDate).toLocaleDateString()}</p>
                <p class="meta">Erledigt: ${todo.percentage}%</p>
                <div class="actions">
                    <button class="edit-btn" data-id="${todo.id}">Bearbeiten</button>
                    <button class="delete-btn" data-id="${todo.id}">Löschen</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    // Funktion zum Speichern der TODOs im LocalStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Funktion zur Validierung der Formularfelder
    function validateForm() {
        let isValid = true;
        // Einfache Validierung: Sind Pflichtfelder ausgefüllt?
        // Man könnte hier spezifischere Fehlermeldungen pro Feld hinzufügen
        if (!titleInput.value.trim()) {
            alert("Titel ist ein Pflichtfeld.");
            isValid = false;
        }
        if (!descriptionInput.value.trim()) {
            alert("Beschreibung ist ein Pflichtfeld.");
            isValid = false;
        }
        if (!authorInput.value.trim()) {
            alert("Autor ist ein Pflichtfeld.");
            isValid = false;
        }
        if (!categoryInput.value) {
            alert("Kategorie ist ein Pflichtfeld.");
            isValid = false;
        }
        if (!startDateInput.value) {
            alert("Startdatum ist ein Pflichtfeld.");
            isValid = false;
        }
        if (!endDateInput.value) {
            alert("Enddatum ist ein Pflichtfeld.");
            isValid = false;
        }
        if (startDateInput.value && endDateInput.value && new Date(endDateInput.value) < new Date(startDateInput.value)) {
            alert("Das Enddatum darf nicht vor dem Startdatum liegen.");
            isValid = false;
        }
        const percentage = parseInt(percentageInput.value);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            alert("Prozentsatz muss zwischen 0 und 100 liegen.");
            isValid = false;
        }
        return isValid;
    }

    // Funktion zum Zurücksetzen des Formulars und Umschalten der Buttons
    function resetFormAndButtons() {
        todoForm.reset(); // Formularfelder leeren
        todoIdInput.value = ''; // Versteckte ID leeren
        addBtn.classList.remove('hidden');
        updateBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
    }

    // Event Listener für das Absenden des Formulars (Hinzufügen/Aktualisieren)
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Standard-Formularabsendung verhindern

        if (!validateForm()) {
            return; // Abbruch bei ungültiger Validierung
        }

        const id = todoIdInput.value; // ID für Bearbeitung oder leer für neues TODO
        const todoData = {
            title: titleInput.value.trim(),
            isEvent: isEventInput.value === 'true',
            description: descriptionInput.value.trim(),
            author: authorInput.value.trim(),
            category: categoryInput.value,
            isImportant: isImportantInput.checked,
            isUrgent: isUrgentInput.checked,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            percentage: parseInt(percentageInput.value)
        };

        if (id) { // TODO aktualisieren
            const todoIndex = todos.findIndex(t => t.id === id);
            if (todoIndex > -1) {
                todos[todoIndex] = { ...todos[todoIndex], ...todoData };
            }
        } else { // Neues TODO hinzufügen
            todoData.id = Date.now().toString(); // Eindeutige ID generieren
            todos.push(todoData);
        }

        saveTodos();
        renderTodos();
        resetFormAndButtons();
    });

    // Event Listener für Klicks auf der TODO-Liste (Bearbeiten/Löschen)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const todoId = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (confirm("Möchten Sie dieses TODO wirklich löschen?")) {
                todos = todos.filter(todo => todo.id !== todoId);
                saveTodos();
                renderTodos();
                resetFormAndButtons(); // Falls gerade ein TODO im Formular bearbeitet wurde
            }
        } else if (target.classList.contains('edit-btn')) {
            const todoToEdit = todos.find(todo => todo.id === todoId);
            if (todoToEdit) {
                todoIdInput.value = todoToEdit.id;
                titleInput.value = todoToEdit.title;
                isEventInput.value = todoToEdit.isEvent.toString();
                descriptionInput.value = todoToEdit.description;
                authorInput.value = todoToEdit.author;
                categoryInput.value = todoToEdit.category;
                isImportantInput.checked = todoToEdit.isImportant;
                isUrgentInput.checked = todoToEdit.isUrgent;
                startDateInput.value = todoToEdit.startDate;
                endDateInput.value = todoToEdit.endDate;
                percentageInput.value = todoToEdit.percentage;

                addBtn.classList.add('hidden');
                updateBtn.classList.remove('hidden');
                cancelBtn.classList.remove('hidden');
                window.scrollTo(0, 0); // Zum Formular scrollen
            }
        }
    });

    // Event Listener für den "Abbrechen"-Button im Bearbeitungsmodus
    cancelBtn.addEventListener('click', () => {
        resetFormAndButtons();
    });

    // Event Listener für das Suchfeld
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredTodos = todos.filter(todo =>
            todo.title.toLowerCase().includes(searchTerm) ||
            todo.description.toLowerCase().includes(searchTerm) ||
            todo.author.toLowerCase().includes(searchTerm)
        );
        renderTodos(filteredTodos);
    });

    // Initiales Rendern der TODOs beim Laden der Seite
    renderTodos();
});