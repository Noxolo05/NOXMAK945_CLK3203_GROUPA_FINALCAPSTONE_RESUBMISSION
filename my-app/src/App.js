import './App.css';
import Carousel from './Carousel';
import carouselData from './carouselData';
import PodcastGrid from './PodcastGrid';

function App() {
  return (
    <div className="App">
      <Carousel data={carouselData}
      />
      <PodcastGrid/>
    </div>
  );
}

export default App;