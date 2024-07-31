import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Carousel = ({ data }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
  };

  const imageStyle = {
    maxWidth: '70%',
    height: '300px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div>
      <h1 className="trending" style={{ textAlign: 'center', color: '#3498db', fontSize: '2em', margin: '20px 0' }}>
        Trending
      </h1>
      <Slider {...settings}>
        {data.map((item) => (
          <div key={item.id} style={{ textAlign: 'center' }}>
            <img
              className="carousel--image"
              src={item.image}
              alt=""
              style={imageStyle}
            />
            <h3
              className="carousel--title"
              style={{ color: '#2ecc71', margin: '10px 0' }}
            >
              {item.title}
            </h3>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
