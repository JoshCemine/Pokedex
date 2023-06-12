import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PokemonDetail = () => {
  const { id } = useParams();
  const [pokemonDetails, setPokemonDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );
      setPokemonDetails(response.data);
    };
    fetchData();
  }, [id]);

  if (!pokemonDetails) {
    return "Loading...";
  }

  return (
    <div>
      <h2>{pokemonDetails.name}</h2>
      {/* Display other details here */}
    </div>
  );
};

export default PokemonDetail;
