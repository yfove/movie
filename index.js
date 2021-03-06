const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${imgSrc}" />
    ${movie.Title} (${movie.Year})
  `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "9d66d2c3",
        s: searchTerm,
      },
    });

    if (response.data.Error) {
      return [];
    }

    return response.data.Search;
  },
};

createAutoComplete({
  ...autoCompleteConfig,
  // ... means make a copy of all the functions and throw it in here
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"));
  },
});
createAutoComplete({
  ...autoCompleteConfig,
  // ... means make a copy of all the functions and throw it in here
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"));
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "9d66d2c3",
      i: movie.imdbID,
    },
  });

  // console.log(response.data);
  summaryElement.innerHTML = movieTemplate(response.data);

  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }

  const runComparison = () => {
    const leftSideStats = document.querySelectorAll(
      "#left-summary .notification"
    );
    const rightSideStats = document.querySelectorAll(
      "#right-summary .notification"
    );

    leftSideStats.forEach((leftStat, index) => {
      const rightStat = -rightSideStats[index];

      const leftSideValue = leftStat.dataset.value;
      const rightSideValue = rightStat.dataset.value;

      if (rightSideValue > leftSideValue) {
        leftStat.classList.remove("is-primary");
        leftStat.classList.add("is-warning");
      } else {
        rightStat.classList.remove("is-primary");
        rightStat.classList.add("is-warning");
      }
    });
    console.log(leftStat, rightStat);
  };
};

const movieTemplate = (movieDetail) => {
  // '$629,000,000'
  // const dollars = parseInt(
  //   movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  // );
  const metascore = parseint(movieDetail.Metascore);
  const imbdRating = parseFloat(movieDetail.imdbRating);
  const imbdVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.awards.split("").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  console.log(awards, metascore, imdbRating, imdbVotes);

  return `
  <article class="media">
  <figure class="media-left">
    <p class="image">
      <img src="${movieDetail.Poster}" alt="" />
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <h1>${movieDetail.Title}</h1>
      <h4>${movieDetail.Genre}</h4>
      <p>${movieDetail.Plot}</p>
    </div>
  </div>
</article>

<article data-value=${awards} class="notification is-primary">
  <p class="title">${movieDetail.Awards}</p>
  <p class="subtitle">Awards</p>
</article>
<article data-value=${metascore} class="notification is-primary">
  <p class="title">${movieDetail.Metascore}</p>
  <p class="subtitle">Meta Critic Score</p>
</article>
<article data-value=${imdbRating} class="notification is-primary">
  <p class="title">${movieDetail.imdbRating}</p>
  <p class="subtitle">imdb Rating</p>
</article>
<article data-value=${imdbVotes} class="notification is-primary">
  <p class="title">${movieDetail.imdbVotes}</p>
  <p class="subtitle">imdb Votes</p>
</article>


`;
};
