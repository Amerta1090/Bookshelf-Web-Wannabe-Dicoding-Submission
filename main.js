document.addEventListener('DOMContentLoaded', () => {
    const bookList = [];
    const RENDER_EVENT = 'render-book';
    const SAVED_EVENT = 'saved-book';
    const STORAGE_KEY = 'BOOKSHELF_APPS';

    const searchBookTitle = document.getElementById('searchBookTitle');
    const inputBookIsComplete = document.getElementById('inputBookIsComplete');
    const bookSubmit = document.getElementById('bookSubmit');

    function isStorageExist() {
        if (typeof(Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year: Number(year),     
            isComplete
        };
    }
    

    function findBook(bookId) {
        for (const bookItem of bookList) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    function findBookIndex(bookId) {
        for (const index in bookList) {
            if (bookList[index].id === bookId) {
                return index;
            }
        }
        return -1;
    }

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(bookList);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const book of data) {
                bookList.push(book);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function makeBook(bookObject) {
        const {id, title, author, year, isComplete} = bookObject;

        const bookTitle = document.createElement('h3');
        bookTitle.innerText = title;

        const bookAuthor = document.createElement('p');
        bookAuthor.innerText = `Penulis: ${author}`;

        const bookYear = document.createElement('p');
        bookYear.innerText = `Tahun: ${year}`;

        const textContainer = document.createElement('div');
        textContainer.append(bookTitle, bookAuthor, bookYear);

        const container = document.createElement('div');
        container.classList.add('book_item');
        container.append(textContainer);
        container.setAttribute('id', `book-${id}`);

        if (isComplete) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('green');
            undoButton.innerText = 'Belum selesai dibaca';
            undoButton.addEventListener('click', function () {
                undoBookFromCompleted(id);
            });

            const editButton = document.createElement('button');
            editButton.classList.add('blue');
            editButton.innerText = 'Edit';
            editButton.addEventListener('click', function () {
                openEditModal(id);
            });

            const trashButton = document.createElement('button');
            trashButton.classList.add('red');
            trashButton.innerText = 'Hapus buku';
            trashButton.addEventListener('click', function () {
                removeBookFromCompleted(id);
            });

            const actionContainer = document.createElement('div');
            actionContainer.classList.add('action');
            actionContainer.append(undoButton, editButton, trashButton);
            container.append(actionContainer);
        } else {
            const checkButton = document.createElement('button');
            checkButton.classList.add('green');
            checkButton.innerText = 'Selesai dibaca';
            checkButton.addEventListener('click', function () {
                addBookToCompleted(id);
            });

            const editButton = document.createElement('button');
            editButton.classList.add('blue');
            editButton.innerText = 'Edit';
            editButton.addEventListener('click', function () {
                openEditModal(id);
            });

            const trashButton = document.createElement('button');
            trashButton.classList.add('red');
            trashButton.innerText = 'Hapus buku';
            trashButton.addEventListener('click', function () {
                removeBookFromCompleted(id);
            });

            const actionContainer = document.createElement('div');
            actionContainer.classList.add('action');
            actionContainer.append(checkButton, editButton, trashButton);
            container.append(actionContainer);
        }

        return container;
    }

    function addBook() {
        const bookTitle = document.getElementById('inputBookTitle').value;
        const bookAuthor = document.getElementById('inputBookAuthor').value;
        const bookYear = Number(document.getElementById('inputBookYear').value); 
    
        const bookIsComplete = document.getElementById('inputBookIsComplete').checked;
    
        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
        bookList.push(bookObject);
    
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function addBookToCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget == null) return;

        bookTarget.isComplete = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function removeBookFromCompleted(bookId) {
        const bookTarget = findBookIndex(bookId);

        if (bookTarget === -1) return;

        bookList.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function undoBookFromCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget == null) return;

        bookTarget.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function openEditModal(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;

        const editModal = document.getElementById('editModal');
        const editBookTitle = document.getElementById('editBookTitle');
        const editBookAuthor = document.getElementById('editBookAuthor');
        const editBookYear = document.getElementById('editBookYear');
        const editBookIsComplete = document.getElementById('editBookIsComplete');
        const saveEditButton = document.getElementById('saveEdit');

        editBookTitle.value = bookTarget.title;
        editBookAuthor.value = bookTarget.author;
        editBookYear.value = bookTarget.year;
        editBookIsComplete.checked = bookTarget.isComplete;

        editModal.style.display = 'block';

        saveEditButton.onclick = function (event) {
            event.preventDefault();
            saveEdit(bookId);
        };
    }

    function saveEdit(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
    
        const editBookTitle = document.getElementById('editBookTitle').value;
        const editBookAuthor = document.getElementById('editBookAuthor').value;
        const editBookYear = Number(document.getElementById('editBookYear').value); 
        const editBookIsComplete = document.getElementById('editBookIsComplete').checked;
    
        bookTarget.title = editBookTitle;
        bookTarget.author = editBookAuthor;
        bookTarget.year = editBookYear;
        bookTarget.isComplete = editBookIsComplete;
    
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    
        const editModal = document.getElementById('editModal');
        editModal.style.display = 'none';
    }

    document.addEventListener(RENDER_EVENT, function () {
        const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
        const completeBookshelfList = document.getElementById('completeBookshelfList');

        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const bookItem of bookList) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isComplete) {
                incompleteBookshelfList.append(bookElement);
            } else {
                completeBookshelfList.append(bookElement);
            }
        }
    });

    document.addEventListener(SAVED_EVENT, function () {
        console.log('Data berhasil disimpan.');
    });

    document.getElementById('inputBook').addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    document.getElementById('searchBook').addEventListener('submit', function (event) {
        event.preventDefault();
        const searchValue = searchBookTitle.value.toLowerCase();
        const filteredBooks = bookList.filter(book => book.title.toLowerCase().includes(searchValue));
        document.getElementById('incompleteBookshelfList').innerHTML = '';
        document.getElementById('completeBookshelfList').innerHTML = '';

        for (const bookItem of filteredBooks) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isComplete) {
                document.getElementById('incompleteBookshelfList').append(bookElement);
            } else {
                document.getElementById('completeBookshelfList').append(bookElement);
            }
        }
    });

    const modal = document.getElementById('editModal');
    const closeBtn = document.getElementsByClassName('close')[0];

    closeBtn.onclick = function () {
        modal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});
