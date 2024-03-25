// Initialize notes array
let notesData = [];

// Fetch notes from server
function fetchNotes() {
    fetch('http://localhost:5500/meeting-notes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }
            return response.json();
        })
        .then(notes => {
            notesData = notes;
            displayNotes(notesData);
        })
        .catch(error => {
            console.error('Error fetching notes:', error.message);
        });
}

// Function to update notes on the server
function updateNotesFile(updatedNotes) {
    // Update notes on the server
    fetch('http://localhost:5500/meeting-notes', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedNotes)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update notes');
        }
        fetchNotes(); // Fetch updated notes
    })
    .catch(error => {
        console.error('Error updating notes:', error.message);
    });
}

// Function to save edited note to server
function saveEditedNoteToJSON(oldNote, editedNote) {
    fetch(`http://localhost:5500/meeting-notes/${oldNote._id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedNote)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update note');
        }
        fetchNotes(); // Fetch updated notes and refresh content area
    })
    .catch(error => {
        console.error('Error updating note:', error.message);
    });
}

// Function to save newly created note to server
function saveNewNoteToJSON(newNote) {
    fetch('http://localhost:5500/meeting-notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create note');
        }
        fetchNotes(); // Fetch updated notes
    })
    .catch(error => {
        console.error('Error creating note:', error.message);
    });
}

// Function to display notes
function displayNotes(notes) {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    notes.forEach(note => {
        const listItem = document.createElement('li');
        listItem.classList.add('note');
        listItem.innerHTML = `
            <span class="note-title">${note.title}</span> - 
            <span class="truncated-content">${truncateContent(note.content)}</span> -
            <span class="created-time">${new Date(note.createdDate).toLocaleString()}</span>`;
        listItem.addEventListener('click', () => {
            displayExpandedView(note);
        });
        notesList.appendChild(listItem);
    });
}

// Truncate content
function truncateContent(content, maxLength = 10) {
    return content.split(' ').slice(0, maxLength).join(' ') + '...';
}

// Display expanded view of note
function displayExpandedView(note) {
    const expandedNote = document.querySelector('.expanded-note');
    expandedNote.innerHTML = `
        <div class="expanded-view">
            <h2>${note.title}</h2>
            <p>${note.content}</p>
            <h3>Action Items</h3>
            <ul>
                ${note.actionItems.map(item => `<input type="checkbox">${item} <br>`).join('')}
            </ul>
            <button class="edit-note">Edit</button>
            <button class="delete-note" data-note-id="${note._id}">Delete</button>
        </div>
    `;
    expandedNote.classList.add('expanded');
    
    // Add event listener for edit button
    const editButton = expandedNote.querySelector('.edit-note');
    editButton.addEventListener('click', () => {
        editNoteForm(note);
    });

    // Add event listener for delete button
    const deleteButton = expandedNote.querySelector('.delete-note');
    deleteButton.addEventListener('click', () => {
        deleteNoteById(note._id);
    });
}

// Function to delete a note by ID
function deleteNoteById(noteId) {
    fetch(`http://localhost:5500/meeting-notes/${noteId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
        fetchNotes(); // Fetch updated notes and refresh content area
    })
    .catch(error => {
        console.error('Error deleting note:', error.message);
    });
}
// Edit note
function editNoteForm(note) {
    const expandedNote = document.querySelector('.expanded-note');
    expandedNote.innerHTML = `
        <h2>Edit Note</h2>
        <form id="edit-note-form">
            <label for="edit-title">Title:</label><br>
            <input type="text" id="edit-title" name="edit-title" value="${note.title}"><br>
            <label for="edit-content">Content:</label><br>
            <textarea id="edit-content" name="edit-content">${note.content}</textarea><br>
            <label for="edit-action-items">Action Items:</label><br>
            <input type="text" id="edit-action-items" name="edit-action-items" value="${note.actionItems.join(', ')}"><br>
            <button type="submit">Save</button>
        </form>
    `;
    
    // Add event listener for form submission
    const editNoteForm = document.getElementById('edit-note-form');
    editNoteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const editedNote = {
            title: document.getElementById('edit-title').value,
            content: document.getElementById('edit-content').value,
            actionItems: document.getElementById('edit-action-items').value.split(',').map(item => item.trim())
        };
        saveEditedNoteToJSON(note, editedNote); // Save edited note to server
    });
}

// Add event listener for creating a new note
document.getElementById('create-note').addEventListener('click', () => {
    createNoteForm();
});

// Create new note
function createNoteForm() {
    const expandedNote = document.querySelector('.expanded-note');
    expandedNote.innerHTML = `
        <h2>Create New Note</h2>
        <form id="create-note-form">
            <label for="note-title">Title:</label><br>
            <input type="text" id="note-title" name="note-title"><br>
            <label for="note-content">Content:</label><br>
            <textarea id="note-content" name="note-content"></textarea><br>
            <label for="note-action-items">Action Items:</label><br>
            <input type="text" id="note-action-items" name="note-action-items"><br>
            <button type="submit">Save</button>
        </form>
    `;
    
    // Add event listener for form submission
    const createNoteForm = document.getElementById('create-note-form');
    createNoteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const actionItems = document.getElementById('note-action-items').value.split(',').map(item => item.trim());
        const createdDate = new Date().toISOString(); // Get current date and time
        const newNote = { title, content, actionItems, createdDate }; // Include createdDate field
        saveNewNoteToJSON(newNote); // Save newly created note to server
    });
}
function searchAndFilterNotes(keywords, startDate, endDate) {
    const queryParams = new URLSearchParams();
    if (keywords) {
        queryParams.append('keywords', keywords);
    }
    if (startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);
    }

    fetch(`http://localhost:5500/meeting-notes/search?${queryParams.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to search and filter notes');
            }
            return response.json();
        })
        .then(notes => {
            displayNotes(notes);
        })
        .catch(error => {
            console.error('Error searching and filtering notes:', error.message);
        });
}
function handleSearch() {
    const searchInput = document.getElementById('search-input').value;
    searchNotes(searchInput);
}

// Function to search notes based on keywords
function searchNotes(keywords) {
    fetch(`http://localhost:5500/meeting-notes/search?keywords=${encodeURIComponent(keywords)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to search notes');
            }
            return response.json();
        })
        .then(notes => {
            displayNotes(notes);
        })
        .catch(error => {
            console.error('Error searching notes:', error.message);
        });
}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', handleSearch);

// Optional: Add event listener to search input field to trigger search on Enter key press
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Initial fetch of notes
fetchNotes();
