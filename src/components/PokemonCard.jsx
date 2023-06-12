import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PokemonCard.css"

function PokemonCard({ pokemon }) {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const imgUrl = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(pokemon.id).padStart(3, "0")}.png`;

  useEffect(() => {
    fetch(pokemon.url)
      .then((response) => response.json())
      .then((data) => setPokemonDetails(data));
  }, [pokemon.url]);

  const handleCardClick = () => {
    console.log(pokemonDetails); // Replace this with code to show the details in a modal or another component
  };

  return (
    <div className="card" onClick={handleCardClick}>
        <Link to={`/pokemon/${pokemon.id}`}>
            <p>ID: {pokemon.id}</p>
            <h2>{pokemon.name}</h2>
            <div className='card_image'>
                <img src={imgUrl} alt={pokemon.name} />
            </div>
            <div className='card_info'>
                {pokemonDetails && <p>Type: {pokemonDetails.types[0].type.name}</p>}
            </div>
        </Link>
    </div>
  );


}

export default PokemonCard;
