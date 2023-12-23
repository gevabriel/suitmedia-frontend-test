const header = document.querySelector('header');
let prevScrollPos = window.pageYOffset;

window.addEventListener('scroll', function () {
    const currentScrollPos = window.pageYOffset;

    if (prevScrollPos > currentScrollPos) {
        header.classList.remove('hidden');
        header.style.opacity = '0.9';
    } else {
        header.classList.add('hidden');
    }

    prevScrollPos = currentScrollPos;
});

window.addEventListener('scroll', function () {
    const scrolled = window.scrollY > 20;
    header.style.opacity = scrolled ? '0.9' : '1';
});

document.addEventListener("DOMContentLoaded", function () {
    const parallax = document.querySelector(".parallax");
    parallax.style.backgroundImage = "url('img/banner.jpg')";
});

document.addEventListener('DOMContentLoaded', function () {
    const ideasContainer = document.getElementById('card-grid');
    const showPerPageSelect = document.querySelector('.show-page select');
    const sortSelect = document.querySelector('.sort select');
    const paginationContainer = document.querySelector('.pagination .page-numbers');

    const urlParams = new URLSearchParams(window.location.search);
    let type = urlParams.get('type') || 'newest';
    let currentPage = parseInt(urlParams.get('page'), 10) || 1;
    let ideasPerPage = 10;

    function updateURLParams() {
        const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}?type=${type}&page=${currentPage}`;
        window.history.pushState({ path: newURL }, '', newURL);
    }

    sortSelect.addEventListener('change', function () {
        type = this.value;
        ideasContainer.innerHTML = '';
        fetchIdeas();
        updateURLParams();
    });

    showPerPageSelect.addEventListener('change', function () {
        ideasPerPage = parseInt(this.value, 10);
        ideasContainer.innerHTML = '';
        fetchIdeas();
        updateURLParams();
    });

    function changePage(newPage) {
        ideasContainer.innerHTML = '';
        currentPage = newPage;
        fetchIdeas();
        updateURLParams();
    }

    function fetchIdeas() {
        let a = 0;
        fetch('data.json')
            .then(response => response.json())
            .then(ideasData => {
                let sortedIdeas;
                let slicedIdeas;
                if (type === 'newest') {
                    sortedIdeas = ideasData.ideas.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
                    slicedIdeas = sortedIdeas.slice((currentPage - 1) * ideasPerPage, currentPage * ideasPerPage);
                } else {
                    sortedIdeas = ideasData.ideas.sort((a, b) => new Date(a.published_at) - new Date(b.published_at));
                    slicedIdeas = sortedIdeas.slice((currentPage - 1) * ideasPerPage, currentPage * ideasPerPage);
                }

                slicedIdeas.forEach((idea, index) => {
                    const isEven = index % 2 === 0;
                    const img = `img/${isEven ? 'even' : 'odd'}.jpg`;

                    const isoDateString = idea.published_at;
                    const date = new Date(isoDateString);

                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formatter = new Intl.DateTimeFormat('id-ID', options);

                    const formattedDate = formatter.format(date);
                    const ideaElement = document.createElement('div');
                    ideaElement.innerHTML = `
                        <div class="card" style="width: 18rem;">
                            <img loading="lazy" src="${img}" class="card-img-top" alt="${idea.title}">
                            <div class="card-body">
                                <p class="card-text" style="color: #808080;">${formattedDate}</p>
                                <h5 class="card-title">${idea.title}</h5>
                            </div>
                        </div>
                    `;
                    ideasContainer.appendChild(ideaElement);
                    a++;
                });

                const show = document.getElementById('show');
                show.innerHTML = `<b>Showing ${(currentPage - 1) * ideasPerPage + 1} - ${Math.min(currentPage * ideasPerPage, ideasData.ideas.length)} of ${ideasData.ideas.length}`;
                updatePagination(ideasData.ideas.length);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function updatePagination(totalIdeas) {
        const totalPages = Math.ceil(totalIdeas / ideasPerPage);
        const paginationHTML = generatePaginationHTML(totalPages);
        paginationContainer.innerHTML = paginationHTML;

        const pageLinks = document.querySelectorAll('.pagination .page-numbers li a');
        pageLinks.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                changePage(parseInt(this.textContent, 10));
            });
        });
    }

    function generatePaginationHTML(totalPages) {
        let html = '';

        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage ? 'active' : '';
            html += `<li class="page-item ${isActive}"><a href="#" class="page-link">${i}</a></li>`;
        }

        return html;
    }

    fetchIdeas();
});

window.addEventListener('load', function () {
    const loadingOverlay = document.getElementById('loadingOverlay');
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 500);
});
