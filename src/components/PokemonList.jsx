import React from "react";

import PokemonCard from "./PokemonCard";
import "./PokemonList.css";

const PokemonList = ({ pokemonData }) => {
    return (
        <div className='pokemon_list'>
            {pokemonData.map((pokemon, index) => {
                return (
                    <PokemonCard
                        key={index}
                        pokemon={pokemon}
                    />
                );
            })}
        </div>
    );
};

export default PokemonList;
