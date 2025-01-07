document.addEventListener('DOMContentLoaded', function () {
    // logic d authentification
    if (document.getElementById('authForm')) {
        document.getElementById('authForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];

            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                localStorage.setItem('loggedInUser', username);  // bach t7at user logged in f local storage
                window.location.href = 'home.html';
            } else {
                document.getElementById('message').textContent = 'User not found!';
            }
        });

        document.getElementById('signupBtn').addEventListener('click', function () {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];

            if (users.find(user => user.username === username)) {
                document.getElementById('message').textContent = 'User already exists!';
            } else {
                users.push({ username, password });
                localStorage.setItem('users', JSON.stringify(users));
                document.getElementById('message').textContent = 'Sign-Up successful! You can now log in.';
            }
        });
    }

    // bach njibo user mn local storage
    const currentUser = localStorage.getItem('loggedInUser');
    if (!currentUser && !window.location.pathname.includes('index.html')) {
    // yla makan ta user dayr login kan redirectiw user l login page (b7al guards f angular) 
    window.location.href = 'index.html';
    return;
    }

    let books = JSON.parse(localStorage.getItem(`books_${currentUser}`)) || [];  // Stori books l logged in user

    function renderBooks() {
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '';

        books.forEach((book, index) => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book');

            bookElement.innerHTML = `
                <img src="${book.image}" alt="${book.title}" class="book-image">
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Year: ${book.year}</p>
                <button onclick="deleteBook(${index})" class="btn danger-btn">Delete</button>
                <button onclick="editBook(${index})" class="btn primary-btn">Update</button>
            `;

            bookList.appendChild(bookElement);
        });
    }

    if (document.getElementById('newBookForm')) {
        document.getElementById('newBookForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const year = document.getElementById('year').value;
            const imageFile = document.getElementById('image').files[0];

            const reader = new FileReader();
            reader.onload = function (event) {
                const imageBase64 = event.target.result; // Base64 string to image

                // kanzido new book l array
                books.push({ title, author, year, image: imageBase64 });

                // Saviw l array d books o user dyalhom f local storage
                localStorage.setItem(`books_${currentUser}`, JSON.stringify(books));

                renderBooks();

                // bach ndiro reset l form
                document.getElementById('newBookForm').reset();
                document.getElementById('bookForm').classList.add('hidden');
            };

            if (imageFile) {
                reader.readAsDataURL(imageFile); // Convert image to Base64
            } else {
                alert('Please select an image!');
            }
        });
    }

    if (document.getElementById('addBookBtn')) {
        document.getElementById('addBookBtn').addEventListener('click', function () {
            const bookForm = document.getElementById('bookForm');
            if (bookForm) {
                if (bookForm.classList.contains('hidden')) {
                    bookForm.classList.remove('hidden'); // Show the form
                } else {
                    bookForm.classList.add('hidden'); // Hide the form
                }
            } else {
                console.error('Book form not found!');
            }
        });
    }

    if (window.location.pathname.includes('home.html')) {
        renderBooks();
    }

    function deleteBook(index) {
        // bach n suprimiw l book mn array
        books.splice(index, 1);

        // Update the local storage b array jdid
        localStorage.setItem(`books_${currentUser}`, JSON.stringify(books));

        renderBooks();
    }

    let currentEditIndex = null;

    function editBook(index) {
        const updateForm = document.getElementById('updateForm');
        const book = books[index];

        // bach n3mro form bles info d book
        document.getElementById('editTitle').value = book.title;
        document.getElementById('editAuthor').value = book.author;
        document.getElementById('editYear').value = book.year;

        // Show the form
        updateForm.classList.remove('hidden');
        currentEditIndex = index;
    }

    document.getElementById('editBookForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedTitle = document.getElementById('editTitle').value;
        const updatedAuthor = document.getElementById('editAuthor').value;
        const updatedYear = document.getElementById('editYear').value;
        const updatedImageFile = document.getElementById('editImage').files[0];

        const updatedBook = {
            title: updatedTitle,
            author: updatedAuthor,
            year: updatedYear,
            image: books[currentEditIndex].image, // bach nkhlik image li deja kayna 9bal man uploadiw whda jdida
        };

        // update the image yla uploadina image jdida
        if (updatedImageFile) {
            const reader = new FileReader();
            reader.onload = () => {
                updatedBook.image = reader.result;
                saveUpdatedBook(updatedBook);
            };
            reader.readAsDataURL(updatedImageFile);
        } else {
            saveUpdatedBook(updatedBook);
        }
    });

    function saveUpdatedBook(updatedBook) {
        books[currentEditIndex] = updatedBook;
        localStorage.setItem(`books_${currentUser}`, JSON.stringify(books));
        renderBooks();

        // Hide the update form and reset the currentEditIndex
        document.getElementById('updateForm').classList.add('hidden');
        currentEditIndex = null;
    }

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('updateForm').classList.add('hidden');
        currentEditIndex = null;
    });

    // Expose deleteBook and editBook to the global scope
    window.deleteBook = deleteBook;
    window.editBook = editBook;
});
