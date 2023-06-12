import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";

import "./App.css";
import PokedexLogo from "./assets/Pokedex_logo.png";
import Pikachu from "./assets/Pikachu.gif";
import PokemonList from "./components/PokemonList";
import Loader from "./components/Loader";
import PokemonDetail from "./components/PokemonDetail";

const TOTAL_POKEMON = 1010; // maximum number of Pokemon as of now
const PAGE_SIZE = 10;

const App = () => {
    const [allPokemonData, setAllPokemonData] = useState([]);
    const [pokemonData, setPokemonData] = useState([]);
    const [current, setCurrent] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);
    const [filterBy, setFilterBy] = useState('id'); // default filter
    const [order, setOrder] = useState('asc'); // default order
    const [search, setSearch] = useState(''); // default search

    useEffect(() => {
        const fetchAllPokemonData = async () => {
            setLoading(true);
            const response = await axios.get(
                `https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`
            );

            const sortedData = response.data.results.map(pokemon => ({ 
                ...pokemon, 
                id: parseInt(pokemon.url.split('/')[pokemon.url.split('/').length - 2])
            }));

            setAllPokemonData(sortedData);
            setLoading(false);
        };

        fetchAllPokemonData();
    }, []);

    const sortData = (data) => {
        let sortedData = [...data];

        if (search !== '') {
            const lowercaseSearch = search.toLowerCase();
            sortedData = sortedData.filter(pokemon => 
                pokemon.name.toLowerCase().includes(lowercaseSearch) || 
                pokemon.id.toString().includes(lowercaseSearch)
                );
        }

        sortedData.sort((a, b) => {
            if (order === 'asc') {
                return a[filterBy] > b[filterBy] ? 1 : -1;
            } else {
                return a[filterBy] < b[filterBy] ? 1 : -1;
            }
        });

        return sortedData;
    }

    useEffect(() => {
        const sortedData = sortData(allPokemonData);
        setPokemonData(sortedData.slice(0, PAGE_SIZE));
        setCurrent(PAGE_SIZE);
    }, [filterBy, order, search, allPokemonData]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight && !loading) {
            setLoading(true);

            const sortedData = sortData(allPokemonData);
            const nextPageData = sortedData.slice(current, current + PAGE_SIZE);
            setPokemonData(prev => [...prev, ...nextPageData]);
            setCurrent(prev => prev + PAGE_SIZE);

            setLoading(false);
        }
    }, [loading, allPokemonData, pokemonData, current, filterBy, order, search]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    }

  return (
<Router>
      <Routes>
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
        <Route
          path="/"
          element={
            <>
              <div className='app'>
                <img src={PokedexLogo} className="logo"/>
                <img src={Pikachu} className="run"/>
                <h1>Pokémon Gallery</h1>
                <label>
                    Filter by:
                    <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                        <option value="id">ID</option>
                        <option value="name">Name</option>
                    </select>
                </label>
                <label>
                    Order:
                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </label>
                <label>
                    Search:
                    <input type="text" value={search} onChange={onSearchChange} />
                </label>
                <PokemonList pokemonData={pokemonData} />
                {loading && <Loader />}
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;