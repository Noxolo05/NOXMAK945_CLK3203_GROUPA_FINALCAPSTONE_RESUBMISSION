import React, { useEffect, useState, useRef } from 'react';
import Fuse from 'fuse.js';

// Header Component
function Header({ onSearch, onSortOptionChange, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '15px', color: 'white' }}>
      <button onClick={onBack} style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>Back</button>
      <h1 style={{ margin: '0', fontSize: '1.5em' }}>My Movies</h1>
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." style={{ padding: '10px', marginRight: '10px', border: '1px solid #555', borderRadius: '5px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Search</button>
      </form>
      <select onChange={onSortOptionChange} style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
        <option value="">Sort by:</option>
        <option value="az">Title A-Z</option>
        <option value="za">Title Z-A</option>
        <option value="dateAsc">Date Ascending</option>
        <option value="dateDesc">Date Descending</option>
      </select>
    </div>
  );
}

// PodcastGrid Component
function PodcastGrid({ height, width }) {
  const [rowData, setRowData] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [sortOption, setSortOption] = useState('');
  const [originalData, setOriginalData] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeasonData, setSelectedSeasonData] = useState([]);
  const [favoritesData, setFavoritesData] = useState({});
  const [favoritesSortOption, setFavoritesSortOption] = useState('');
  const [isAudioPlayerVisible, setIsAudioPlayerVisible] = useState(false);
  const [audioPlayerProgress, setAudioPlayerProgress] = useState(0);
  const [lastListened, setLastListened] = useState({
    show: null,
    episode: null,
    timestamp: 0,
  });
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    // Load favorites from localStorage when the component mounts
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || {};
    setFavoritesData(storedFavorites);
  }, []);

  useEffect(() => {
    // Save favorites to localStorage whenever it changes
    localStorage.setItem('favorites', JSON.stringify(favoritesData));
  }, [favoritesData]);

  useEffect(() => {
    const storedLastListened = JSON.parse(localStorage.getItem('lastListened')) || {};
    setLastListened(storedLastListened);

    if (storedLastListened.show && storedLastListened.episode) {
      setIsAudioPlayerVisible(true);
      setAudioPlayerProgress(storedLastListened.timestamp);
    }
  }, []);

  useEffect(() => {
    if (lastListened.show && lastListened.episode) {
      localStorage.setItem('lastListened', JSON.stringify(lastListened));
    }
  }, [lastListened]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioPlayerRef.current) {
        setAudioPlayerProgress(audioPlayerRef.current.currentTime);
      }
    };

    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer) {
      audioPlayer.addEventListener('timeupdate', updateProgress);

      return () => {
        audioPlayer.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://podcast-api.netlify.app/shows')
      .then(response => response.json())
      .then(shows => {
        const promises = shows.map(show => {
          return fetch(`https://podcast-api.netlify.app/id/${show.id}`)
            .then(response => response.json())
            .then(showData => {
              const id = showData.id;
              const title = showData.title;
              const description = showData.description;
              const seasons = showData.seasons;
              const image = showData.image;
              const genres = showData.genres ? showData.genres.join(', ') : '';
              const updated = showData.updated;
              const episodes = showData.episodes || [];

              return { id, title, description, seasons, image, genres, updated, episodes };
            });
        });

        Promise.all(promises)
          .then(data => {
            setRowData(data);
            setOriginalData(data);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error:', error);
            setIsLoading(false);
          });
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedShow && selectedShow.seasons[selectedSeason - 1]) {
      setSelectedSeasonData(selectedShow.seasons[selectedSeason - 1].episodes);
    }
  }, [selectedSeason, selectedShow]);

  const handleAddToFavorites = (episode) => {
    const { id, title, show, season } = episode;
    const key = `${show}-${season}`;

    setFavoritesData((prevFavorites) => {
      const updatedFavorites = { ...prevFavorites };
      if (!updatedFavorites[key]) {
        updatedFavorites[key] = { show, season, episodes: [] };
      }
      updatedFavorites[key].episodes.push({ id, title, dateAdded: new Date().toLocaleString() });
      return updatedFavorites;
    });
  };

  const handleRemoveFromFavorites = (episode) => {
    const { id, show, season } = episode;
    const key = `${show}-${season}`;

    setFavoritesData((prevFavorites) => {
      const updatedFavorites = { ...prevFavorites };
      if (updatedFavorites[key]) {
        updatedFavorites[key].episodes = updatedFavorites[key].episodes.filter((ep) => ep.id !== id);
        if (updatedFavorites[key].episodes.length === 0) {
          delete updatedFavorites[key];
        }
      }
      return updatedFavorites;
    });
  };

  const handleFavoritesSortOptionChange = (event) => {
    setFavoritesSortOption(event.target.value);
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleFavorite = (id) => {
    setFavorites({
      ...favorites,
      [id]: {
        dateAdded: new Date().toLocaleDateString(),
        isFavorite: !favorites[id]?.isFavorite,
      },
    });
  };


  const handleGoBack = () => {
    setIsAudioPlayerVisible(false);
    setSelectedShow(null);
  };

  const handleSeasonChange = (event) => {
    setSelectedSeason(parseInt(event.target.value, 10));
  };

  const handleSearch = (searchTerm) => {
    const options = {
      keys: ['title'],
      includeScore: true,
    };
    const fuse = new Fuse(originalData, options);
    const result = fuse.search(searchTerm);
    setRowData(result.map(({ item }) => item));
  };

  const handleGenreClick = (genre) => {
    const filteredData = originalData.filter((row) => row.genres.includes(genre));
    setRowData(filteredData);
  };

  const handleShowClick = (show) => {
    setSelectedShow(show);
    setSelectedSeason(1);
  };

  const handleEpisodePlay = (episode) => {
    if (episode && episode.id) {
    const { id, show, season } = episode;

    setLastListened({
      show: { id: show.id, title: show.title },
      episode: { id, title: episode.title, audioUrl: episode.audioUrl },
      timestamp: 0,
    });

    setIsAudioPlayerVisible(true);
  } else {
    console.error('Invalid episode data:', episode);
  }
};

  const handleAudioPlayerClose = () => {
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
      const confirmClose = window.confirm("Audio is playing. Are you sure you want to close the page?");
      if (!confirmClose) {
        return;
      }
    }

    setIsAudioPlayerVisible(false);

    setLastListened({
      show: null,
      episode: null,
      timestamp: 0,
    });
  };

  const handleResetProgress = () => {
    setLastListened({
      show: null,
      episode: null,
      timestamp: 0,
    });
    localStorage.removeItem('lastListened');
  };

  const sortData = () => {
    let sortedData;
    switch (sortOption) {
      case 'az':
        sortedData = [...rowData].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        sortedData = [...rowData].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'dateAsc':
        sortedData = [...rowData].sort((a, b) => new Date(a.updated) - new Date(b.updated));
        break;
      case 'dateDesc':
        sortedData = [...rowData].sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      default:
        sortedData = rowData;
        break;
    }

    setRowData(sortedData);
  };

  const sortFavoritesData = () => {
    let sortedFavorites;
    switch (favoritesSortOption) {
      case 'az':
        sortedFavorites = Object.keys(favoritesData).sort((a, b) => a.localeCompare(b));
        break;
      case 'za':
        sortedFavorites = Object.keys(favoritesData).sort((a, b) => b.localeCompare(a));
        break;
      case 'dateAsc':
        sortedFavorites = Object.keys(favoritesData).sort((a, b) => {
          const dateA = new Date(favoritesData[a].episodes[0].dateAdded);
          const dateB = new Date(favoritesData[b].episodes[0].dateAdded);
          return dateA - dateB;
        });
        break;
      case 'dateDesc':
        sortedFavorites = Object.keys(favoritesData).sort((a, b) => {
          const dateA = new Date(favoritesData[a].episodes[0].dateAdded);
          const dateB = new Date(favoritesData[b].episodes[0].dateAdded);
          return dateB - dateA;
        });
        break;
      default:
        sortedFavorites = Object.keys(favoritesData);
        break;
    }

    const sortedFavoritesData = {};
    sortedFavorites.forEach((key) => {
      sortedFavoritesData[key] = favoritesData[key];
    });

    setFavoritesData(sortedFavoritesData);
  };

  return (
    <div style={{ height, width, backgroundColor: '#1a1a1a', color: 'white', position: 'static', fontFamily: 'Arial, sans-serif' }}>
     {isAudioPlayerVisible && (
        <audio ref={audioPlayerRef} controls>
          <source src={lastListened.episode.audioUrl} type="audio/mpeg" />
        </audio>
      )}

      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {selectedShow ? (
            <SelectedShowView
              selectedShow={selectedShow}
              selectedSeason={selectedSeason}
              selectedSeasonData={selectedSeasonData}
              handleSeasonChange={handleSeasonChange}
              handleEpisodePlay={handleEpisodePlay}
              handleGoBack={handleGoBack}
              handleAddToFavorites={handleAddToFavorites}
              handleRemoveFromFavorites={handleRemoveFromFavorites}
            />
          ) : (
            <AllShowsView
              rowData={rowData}
              favorites={favoritesData}
              sortData={sortData}
              handleFavorite={handleFavorite}
              handleShowClick={handleShowClick}
              handleGenreClick={handleGenreClick}
              handleSearch={handleSearch}
              handleSortOptionChange={handleSortOptionChange}
              originalData={originalData}
              handleAddToFavorites={handleAddToFavorites}
              handleRemoveFromFavorites={handleRemoveFromFavorites}
              handleFavoritesSortOptionChange={handleFavoritesSortOptionChange}
              sortFavoritesData={sortFavoritesData}
              favoritesSortOption={favoritesSortOption}
              handleResetProgress={handleResetProgress}
            />
          )}
        </>
      )}
    </div>

  );
}

// SelectedShowView Component
function SelectedShowView({
  selectedShow,
  selectedSeason,
  selectedSeasonData,
  handleSeasonChange,
  handleEpisodePlay,
  handleGoBack,
  handleAddToFavorites,
  handleRemoveFromFavorites,
}) {
  return (
    <>
      <Header onSearch={() => {}} onSortOptionChange={() => {}} onBack={handleGoBack} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#333', color: 'white' }}>
        <h2>{selectedShow.title}</h2>
        <p>{selectedShow.description}</p>
        <select onChange={handleSeasonChange} value={selectedSeason} style={{ padding: '10px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', marginBottom: '15px' }}>
          {Array.from({ length: selectedShow.seasons.length }, (_, i) => i + 1).map((season) => (
            <option key={season} value={season}>
              Season {season}
            </option>
          ))}
        </select>
        <div>
        
          <h3>Episodes:</h3>
          <ul>
            {selectedSeasonData.map((episode, index) => (
              <li key={index}>
                {episode.title}{' '}
                <button onClick={() => handleEpisodePlay(episode.id)} style={{ padding: '5px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Play</button>
                <button onClick={() => handleAddToFavorites(episode)}>Add to Favorites</button>
                <button onClick={() => handleRemoveFromFavorites(episode)}>Remove from Favorites</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

// AllShowsView Component
function AllShowsView({ 
  rowData,
  favorites,
  sortData,
  handleFavorite,
  handleShowClick,
  handleGenreClick,
  handleSearch,
  handleSortOptionChange,
  originalData,
  handleAddToFavorites,
  handleRemoveFromFavorites,
}) {
  return (
    <>
      <Header onSearch={handleSearch} onSortOptionChange={handleSortOptionChange} onBack={() => {}} />
      <button onClick={sortData} style={{ padding: '10px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '15px', borderRadius: '5px' }}>Sort</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {rowData.map((row, index) => (
          <ShowCard
          key={index}
          row={row}
          favorites={favorites}
          handleFavorite={handleFavorite}
          handleShowClick={handleShowClick}
          handleGenreClick={handleGenreClick}
          handleAddToFavorites={handleAddToFavorites}
          handleRemoveFromFavorites={handleRemoveFromFavorites}
          />
        ))}
      </div>
    </>
  );
}

// ShowCard Component
function ShowCard({
  row,
  favorites,
  handleFavorite,
  handleShowClick,
  handleGenreClick,
  handleAddToFavorites,
  handleRemoveFromFavorites,
}) {
  return (
    <div style={{ marginBottom: '20px', backgroundColor: '#333', color: 'white', padding: '20px', flex: '0 0 30%', margin: '10px', borderRadius: '5px' }}>
      <img src={row.image} alt={row.title} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px' }} />
      <h2>{row.title}</h2>
      <p>{row.description}</p>
      <button onClick={() => handleShowClick(row)} style={{ padding: '10px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>View Details</button>
      <div style={{ marginTop: '10px' }}>
        <button style={{ marginRight: '10px', padding: '5px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }} onClick={() => handleFavorite(row.id)}>
          {favorites[row.id]?.isFavorite ? '\u2764 Added to favorites on' + favorites[row.id].dateAdded : '\u2764'}
        </button>
        <button onClick={() => handleAddToFavorites(row)}>Add to Favorites</button>
        <button onClick={() => handleRemoveFromFavorites(row)}>Remove from Favorites</button>
      </div>
      <div>
        <h3>Genres:</h3>
        {row.genres.split(', ').map((genre, index) => (
          <span key={index} onClick={() => handleGenreClick(genre)} style={{ cursor: 'pointer', padding: '5px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px', marginRight: '5px', marginBottom: '5px' }}>
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PodcastGrid;
