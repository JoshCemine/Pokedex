import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import "./App.css";
import PokemonList from "./components/PokemonList";
import Loader from "./components/Loader";

const PAGE_SIZE = 10; 

const App = () => {
    const [pokemonData, setPokemonData] = useState([]);
    const [page, setPage] = useState(1); 
    const [loading, setLoading] = useState(false);

    const removeDuplicatePokemons = (data) => {
      return Array.from(new Set(data.map(a => a.id)))
          .map(id => {
              return data.find(a => a.id === id)
          });
    };

    const fetchPokemonData = async () => {
      setLoading(true);
      const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${(page-1) * PAGE_SIZE}`
      );

      setPokemonData((prevData) => {
        const updatedData = [
            ...prevData,
            ...response.data.results.map(pokemon => ({ 
                ...pokemon, 
                id: pokemon.url.split('/')[pokemon.url.split('/').length - 2]
            }))
        ];
        return removeDuplicatePokemons(updatedData);
      });

      setLoading(false);
    };

    useEffect(() => {
      fetchPokemonData();
      console.log(pokemonData)
    }, [page]);



    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop + 1 >=
            document.documentElement.scrollHeight
        ) {
            setLoading(true);
            setPage((prev) => prev + 1);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
        <div className='app'>
            <h1>Pokémon Gallery</h1>
            <PokemonList pokemonData={pokemonData} />
            {loading && <Loader />}
        </div>
    );
};

export default App;
