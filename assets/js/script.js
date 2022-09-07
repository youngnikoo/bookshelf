const books = [];
const STORAGE_KEY = "BOOKSHELF_APPS";
const SHOW_BOOKS_EVENT = "show-books";

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    }
}

function findBook(bookId) {
    for (bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findBookIndex(bookId) {
    for (index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// mengecek apakah storage ada atau tidak di browser kita
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Browser tidak mendukung local storage");
        return false;
    }

    return true;
}

// untuk menyimpan data ke dalam local storage
function saveData() {
    if (isStorageExist()) {
        const parsedToString = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsedToString);
    }
}

// menampilkan data yang sudah tersimpan di local storage 
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(SHOW_BOOKS_EVENT));
}

// membuat tampilan html pada bookshelf
function makeBook(bookObject) {
    const {
        id,
        title,
        author,
        year,
        isComplete
    } = bookObject;

    const textTitle = document.createElement("h3");
    textTitle.innerText = title;

    const textAuthor = document.createElement("p");
    textAuthor.innerText = "Penulis : " + author;

    const textYear = document.createElement("p");
    textYear.innerText = "Tahun : " + year;

    const container = document.createElement("article");
    container.classList.add("book_item");
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute("id", `book-${id}`);

    const containerButton = document.createElement("div");
    containerButton.classList.add("action");

    if (isComplete) {
        const notCompletedButton = document.createElement("button");
        notCompletedButton.innerText = "Belum selesai dibaca";
        notCompletedButton.classList.add("green");
        notCompletedButton.addEventListener("click", function () {
            removeBookFromCompleted(id);
        });

        containerButton.append(notCompletedButton);
    } else {
        const completedButton = document.createElement("button");
        completedButton.innerText = "Selesai dibaca";
        completedButton.classList.add("green");
        completedButton.addEventListener("click", function () {
            addBookToCompleted(id);
        });

        containerButton.append(completedButton);
    }

    const editButton = document.createElement("button");
        editButton.innerText = "Edit buku";
        editButton.classList.add("gold");
        editButton.addEventListener("click", function () {
            const modalBg = document.querySelector('.modal_bg');
            const modalClose = document.getElementById('modalClose');
            const bookId = this.closest('.book_item').id;
            const editForm = document.getElementById('editBook');
            const bookItem = findBook(Number(bookId));
        
            const textTitle = document.getElementById('editBookTitle');
            const textAuthor = document.getElementById('editBookAuthor');
            const textYear = document.getElementById('editBookYear');
            const isComplete = document.getElementById('editBookIsComplete');
        
            textTitle.value = bookItem.title;
            textAuthor.value = bookItem.author;
            textYear.value = bookItem.year;
            isComplete.checked = bookItem.isCompleted;

        editForm.addEventListener('submit', function (event) {
            event.preventDefault();
            editBook(bookId);
            modalBg.classList.remove('bg_active');
            });
      
            modalBg.classList.add('bg_active');
            modalClose.addEventListener('click', function () {
            modalBg.classList.remove('bg_active');
            });
        });

        containerButton.append(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus buku";
    deleteButton.classList.add("red");
    deleteButton.addEventListener("click", function () {
        if (confirm("Apakah anda yakin ingin menghapus data buku ini ?")) {
            deleteBook(id);
        }
    });

    containerButton.append(deleteButton);
    container.append(containerButton);

    return container;
}

function addBook() {
    const id = generateId();
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = document.getElementById("inputBookYear").value;
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    const bookObject = generateBookObject(id, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(SHOW_BOOKS_EVENT));
    saveData();
}

function searchBookByTitle() {
    const title = document.getElementById("searchBookTitle").value.toLowerCase();
    const bookList = document.querySelectorAll(".book_item");

    for (book of bookList) {
        if (book.childNodes[0].innerText.toLowerCase().indexOf(title) > -1) {
            book.style.display = "";
        } else {
            book.style.display = "none";
        }
    }
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(SHOW_BOOKS_EVENT));
    saveData();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(SHOW_BOOKS_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(SHOW_BOOKS_EVENT));
    saveData();
}

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById("searchBook");
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        searchBookByTitle();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SHOW_BOOKS_EVENT, function () {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    for (book of books) {
        const bookElement = makeBook(book);
        if (book.isComplete) {
            completeBookshelfList.append(bookElement);
        } else {
            incompleteBookshelfList.append(bookElement);
        }
    }
});